/**
 * Budget → CSV utilities (framework-agnostic)
 *
 * This educational module shows how to:
 * - Fetch a project's budget using the Saturation SDK
 * - Convert budget lines into CSV with per-phase totals and fields
 * - Traverse sub-accounts: root table, second-level tables, third-level subrows
 *
 * Framework-agnostic: can be used from pages, API routes, or scripts.
 */

import type { Budget, Phase, Saturation, BudgetLine, Account, LinePhaseData, Contact } from '@saturation-api/js';
import { csvEscape, formatNumber, safeCell, pathDepth } from './csvHelpers';

/** Fetch a project's budget with useful expansions. */
export async function fetchBudget(
  client: Saturation,
  projectId: string
): Promise<Budget> {
  return client.getBudget(projectId, {
    expands: ['phases', 'lines.phaseData', 'lines.contact'],
  });
}

/** CSV options for budget → CSV conversion. */
export type BudgetColumn =
  | 'id'
  | 'description'
  | 'tags'
  | 'contact'
  | 'fringes'
  | 'dates'
  | 'quantity'
  | 'rate'
  | 'x';

export type BudgetToCsvOptions = {
  /**
   * Which line types to include in the CSV (default: line, account, subtotal)
   */
  includeLineTypes?: Array<'line' | 'account' | 'subtotal' | 'markup' | 'fringes'>;
  /**
   * Include a header row (default: true)
   */
  includeHeaders?: boolean;
  /**
   * Which non-phase columns to include (order respected).
   * Defaults to ['id','description'] if omitted.
   */
  columns?: BudgetColumn[];
  /**
   * Limit phases to this set of phase aliases (order respected). Defaults to all budget phases.
   */
  phases?: string[]; // aliases
};

/** Convert a budget into a CSV string. */
export function budgetToCsv(budget: Budget, options: BudgetToCsvOptions = {}): string {
  const {
    includeHeaders = true,
    includeLineTypes = ['line', 'account', 'subtotal'],
    columns = ['id', 'description'],
    phases: phaseAliases,
  } = options;

  const allPhases: Phase[] = budget.phases ?? [];
  // Resolve phases strictly by alias (user mode) and preserve order
  const phases: Phase[] = Array.isArray(phaseAliases) && phaseAliases.length
    ? phaseAliases.map((alias) => allPhases.find((p) => p.alias === alias)).filter((p): p is Phase => Boolean(p))
    : allPhases;
  const lines = budget.account?.lines ?? [];

  // Partition selected columns into global vs phase-scoped
  const phaseScoped: BudgetColumn[] = columns.filter((c): c is BudgetColumn => PHASE_SCOPED_BUDGET_COLUMNS.has(c as BudgetColumn));
  const globalCols: BudgetColumn[] = columns.filter((c): c is BudgetColumn => GLOBAL_BUDGET_COLUMNS.has(c as BudgetColumn));

  // Build headers: global columns first, then for each phase add Total and any selected phase-scoped subcolumns
  const headers: string[] = [];
  headers.push(...globalCols);
  for (const phase of phases) {
    const alias = phase.alias ?? phase.id;
    const label = alias;
    // Totals column for this phase
    headers.push(`${label} total`);
    // Selected phase-scoped subcolumns
    for (const col of phaseScoped) {
      headers.push(`${label} ${humanizeColumn(col)}`);
    }
  }

  // Build a function to create a CSV table (rows) for a list of lines
  const buildRowsForLines = (srcLines: BudgetLine[], indentSpaces = 0): string[][] => {
    const out: string[][] = [];
    if (includeHeaders) out.push(headers);
    for (const line of srcLines) {
      if (!includeLineTypes.includes(line.type)) continue;
      out.push(buildRowForLine(line, phases, globalCols, phaseScoped, indentSpaces));
    }
    return out;
  };

  // Root table (top-level)
  const tables: string[][][] = [];
  tables.push(buildRowsForLines(lines, 0));

  // Index sub-accounts by accountId for quick lookup
  const subAccounts = budget.subAccounts ? Object.values(budget.subAccounts) : [];
  const byAccountId = new Map<string, Account>();
  for (const acc of subAccounts) {
    if (acc.accountId) byAccountId.set(acc.accountId, acc);
  }

  // Identify second-level accounts (direct children of root) by path depth
  const secondLevelAccounts = subAccounts.filter((acc) => pathDepth(acc.path) === 1);

  // For each second-level account, create its own table. Inline third-level children as subrows.
  for (const acc of secondLevelAccounts) {
    const rows: string[][] = [];
    // Table title row (omit per-table headers)
    const title = `Account ${acc.accountId ?? acc.id}${acc.description ? ` - ${acc.description}` : ''}`;
    rows.push([title, ...Array(Math.max(0, headers.length - 1)).fill('')]);
    let dataRowCount = 0;
    for (const line of acc.lines) {
      if (!includeLineTypes.includes(line.type)) continue;
      // Parent row (no indent)
      rows.push(buildRowForLine(line, phases, globalCols, phaseScoped, 0));
      dataRowCount++;
      // If this is an account line, inline its child account's lines with indent
      if (line.type === 'account' && line.accountId) {
        const childAcc = byAccountId.get(line.accountId);
        if (childAcc && Array.isArray(childAcc.lines) && childAcc.lines.length) {
          for (const subLine of childAcc.lines) {
            if (!includeLineTypes.includes(subLine.type)) continue;
            rows.push(buildRowForLine(subLine, phases, globalCols, phaseScoped, 4));
            dataRowCount++;
          }
        }
      }
    }
    // Skip empty tables (no data rows after filtering)
    if (dataRowCount > 0) {
      tables.push(rows);
    }
  }

  // Convert tables to CSV and separate by two blank rows
  const tableCsvs = tables.map((rows) => rows.map((r) => r.map(csvEscape).join(',')).join('\n'));
  return tableCsvs.join('\n\n\n');
}

// --- helpers ----------------------------------------------------------------

const GLOBAL_BUDGET_COLUMNS = new Set<BudgetColumn>(['id', 'description', 'tags', 'contact']);
const PHASE_SCOPED_BUDGET_COLUMNS = new Set<BudgetColumn>(['fringes', 'dates', 'quantity', 'rate', 'x']);

function buildGlobalColumnsForLine(
  line: BudgetLine,
  columns: BudgetColumn[],
  indentSpaces = 0
): string[] {
  return columns.map((col) => {
    switch (col) {
      case 'id':
        return safeCell(line.accountId ?? '');
      case 'description':
        return safeCell(`${' '.repeat(indentSpaces)}${line.description ?? ''}`);
      case 'tags':
        return Array.isArray(line.tags) ? safeCell(line.tags.join('; ')) : '';
      case 'contact': {
        const contact: Contact | undefined = line.contact;
        return safeCell(contact?.name ?? contact?.company ?? '');
      }
      default:
        // Ignore phase-scoped here
        return '';
    }
  });
}

function buildPhaseScopedCell(
  line: BudgetLine,
  col: BudgetColumn,
  phaseAlias: string
): string {
  const phaseData: Record<string, LinePhaseData> | undefined = line.phaseData;
  const pd: LinePhaseData | undefined = phaseData?.[phaseAlias];
  switch (col) {
    case 'fringes': {
      const list = Array.isArray(pd?.fringes) ? pd.fringes : [];
      return safeCell(list.join('; '));
    }
    case 'dates': {
      const start = pd?.date?.startDate ?? '';
      const end = pd?.date?.endDate ?? '';
      return start || end ? safeCell(`${start}..${end}`) : '';
    }
    case 'quantity':
      return formatNumber(pd?.quantity);
    case 'rate':
      return formatNumber(pd?.rate);
    case 'x':
      return formatNumber(pd?.multiplier);
    default:
      return '';
  }
}

function buildRowForLine(
  line: BudgetLine,
  phases: Phase[],
  globalCols: BudgetColumn[],
  phaseScoped: BudgetColumn[],
  indentSpaces: number
): string[] {
  const base = buildGlobalColumnsForLine(line, globalCols, indentSpaces);
  const perPhaseCells: string[] = [];
  for (const phase of phases) {
    const phaseKey = phase.alias || phase.id;
    perPhaseCells.push(formatNumber(getLineTotalForPhase(line, phase)));
    for (const col of phaseScoped) {
      perPhaseCells.push(buildPhaseScopedCell(line, col, phaseKey));
    }
  }
  return [...base, ...perPhaseCells];
}

function getLineTotalForPhase(line: BudgetLine, phase: Phase): number | undefined {
  const totals = line.totals as Record<string, number> | undefined;
  if (!totals) return undefined;
  // assume user mode: totals keyed by alias
  return phase.alias ? totals[phase.alias] : undefined;
}

function humanizeColumn(col: BudgetColumn): string {
  return col === 'x' ? 'multiplier' : col;
}

/**
 * Example usage (pseudo-code):
 *
 * import { Saturation } from '@saturation-api/js';
 * import { fetchBudget, budgetToCsv } from './budgetCsv';
 *
 * const client = new Saturation({ apiKey: 'sk_...' });
 * const budget = await fetchBudget(client, 'my-project');
 * const csv = budgetToCsv(budget);
 * console.log(csv);
 */
