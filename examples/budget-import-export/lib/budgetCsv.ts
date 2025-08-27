/**
 * Budget → CSV utilities (framework-agnostic)
 *
 * This small library shows how to:
 * - Fetch a project's budget “topsheet” using the Saturation SDK
 * - Transform the top-level budget lines into a CSV string
 *
 * It is intentionally independent from React so it can be reused from any environment
 * (pages, API routes, node scripts, etc.).
 */

import type { Budget, Phase, Saturation, BudgetLine, Account } from '@saturation-api/js';

/**
 * Fetch the budget topsheet for a project.
 *
 * Notes:
 * - We request `expands: ['phases']` so we can map totals to readable phase aliases.
 * - By default, budget.account.lines returns the top-level lines (topsheet).
 */
export async function fetchBudgetTopSheet(
  client: Saturation,
  projectId: string
): Promise<Budget> {
  const budget = await client.getBudget(projectId, {
    // Include phases for headers and lines.phaseData/contact for column details
    expands: ['phases', 'lines.phaseData', 'lines.contact'],
  });

  console.log('budget', budget);
  return budget;
}

/**
 * CSV options to control how topsheet lines are exported.
 */
export type TopSheetColumn =
  | 'id'
  | 'description'
  | 'tags'
  | 'contact'
  | 'notes'
  | 'fringes'
  | 'dates'
  | 'quantity'
  | 'rate'
  | 'x';

type BudgetCsvOptions = {
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
  columns?: TopSheetColumn[];
  /**
   * Limit phases to this set of phase aliases (order respected). Defaults to all budget phases.
   */
  phases?: string[]; // aliases
};

/**
 * Convert a budget topsheet into a CSV string.
 *
 * Columns:
 * - type, accountId, description
 * - one column per visible phase (using the phase alias from the budget)
 *
 * Totals are taken from each line's `totals[phase.id]` value where available.
 */
export function budgetTopSheetToCsv(budget: Budget, options: BudgetCsvOptions = {}): string {
  const {
    includeHeaders = true,
    includeLineTypes = ['line', 'account', 'subtotal'],
    columns = ['id', 'description'],
    phases: phaseFilter,
  } = options;

  console.log('budget', budget.phases, phaseFilter);
  const allPhases: Phase[] = budget.phases ?? [];
  // If specific phases were requested, map them by alias (fallback to id/name if needed), preserving input order
  const phases: Phase[] = phaseFilter && phaseFilter.length
    ? phaseFilter.map((aliasOrKey) => allPhases.find((p) => p.alias === aliasOrKey || p.id === aliasOrKey || p.name === aliasOrKey)).filter((p): p is Phase => Boolean(p))
    : allPhases;
  const lines = budget.account?.lines ?? [];

  // Partition selected columns into global vs phase-scoped
  const phaseScoped: TopSheetColumn[] = columns.filter((c): c is TopSheetColumn => PHASE_SCOPED_COLUMNS.has(c as TopSheetColumn));
  const globalCols: TopSheetColumn[] = columns.filter((c): c is TopSheetColumn => GLOBAL_COLUMNS.has(c as TopSheetColumn));

  // Build headers: global columns first, then for each phase add Total and any selected phase-scoped subcolumns
  const headers: string[] = [];
  headers.push(...globalCols);
  for (const phase of phases) {
    const phaseLabel = phase.name ?? phase.alias ?? phase.id;
    // Totals column for this phase
    headers.push(phaseLabel);
    // Selected phase-scoped subcolumns
    for (const col of phaseScoped) {
      headers.push(`${phaseLabel} ${humanizeColumn(col)}`);
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

  // Root table (topsheet)
  const tables: string[][][] = [];
  tables.push(buildRowsForLines(lines, 0));

  // Index sub-accounts by accountId for quick lookup
  const subAccounts = budget.subAccounts ? Object.values(budget.subAccounts) : [];
  const byAccountId = new Map<string, Account>();
  for (const acc of subAccounts) {
    if (acc.accountId) byAccountId.set(acc.accountId, acc);
  }

  // Identify 2nd-layer accounts (direct children of root) by path depth
  const rootChildren = subAccounts.filter((acc) => getPathDepth(acc.path) === 1);

  // For each 2nd-layer account, create its own table. Inline its 3rd-level children as subrows.
  for (const acc of rootChildren) {
    const rows: string[][] = [];
    if (includeHeaders) rows.push(headers);
    for (const line of acc.lines as BudgetLine[]) {
      if (!includeLineTypes.includes(line.type)) continue;
      // Parent row (no indent)
      rows.push(buildRowForLine(line, phases, globalCols, phaseScoped, 0));
      // If this is an account line, inline its child account's lines with indent
      if (line.type === 'account' && line.accountId) {
        const childAcc = byAccountId.get(line.accountId);
        if (childAcc && Array.isArray(childAcc.lines) && childAcc.lines.length) {
          for (const subLine of childAcc.lines as BudgetLine[]) {
            if (!includeLineTypes.includes(subLine.type)) continue;
            rows.push(buildRowForLine(subLine, phases, globalCols, phaseScoped, 4));
          }
        }
      }
    }
    tables.push(rows);
  }

  // Convert tables to CSV and separate by two blank rows
  const tableCsvs = tables.map((rows) => rows.map((r) => r.map(csvEscape).join(',')).join('\n'));
  return tableCsvs.join('\n\n\n');
}

// --- helpers ----------------------------------------------------------------

const GLOBAL_COLUMNS = new Set<TopSheetColumn>(['id', 'description', 'tags', 'contact', 'notes']);
const PHASE_SCOPED_COLUMNS = new Set<TopSheetColumn>(['fringes', 'dates', 'quantity', 'rate', 'x']);

function buildGlobalColumnsForLine(line: BudgetLine, columns: TopSheetColumn[], indentSpaces = 0): string[] {
  return columns.map((col) => {
    switch (col) {
      case 'id':
        return safeCell(line.accountId ?? '');
      case 'description':
        return safeCell(`${' '.repeat(indentSpaces)}${line.description ?? ''}`);
      case 'tags':
        return Array.isArray(line.tags) ? safeCell(line.tags.join('; ')) : '';
      case 'contact': {
        const contact = (line as any).contact; // contact is optional on lines
        return safeCell(contact?.name ?? contact?.company ?? '');
      }
      case 'notes':
        return safeCell((line as any).notes ?? '');
      default:
        // Ignore phase-scoped here
        return '';
    }
  });
}

function buildPhaseScopedCell(line: BudgetLine, col: TopSheetColumn, phaseId: string): string {
  const pd = (line as any).phaseData?.[phaseId] as any | undefined;
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
  globalCols: TopSheetColumn[],
  phaseScoped: TopSheetColumn[],
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

function getPathDepth(path: string): number {
  return path.split('/').filter(Boolean).length;
}

function getLineTotalForPhase(line: BudgetLine, phase: Phase): unknown {
  const totals = (line as any).totals as Record<string, unknown> | undefined;
  if (!totals) return undefined;
  const keys = [phase.alias, phase.id, phase.name].filter(Boolean) as string[];
  for (const k of keys) {
    const v = totals[k as keyof typeof totals];
    if (v !== undefined && v !== null) return v;
  }
  return undefined;
}

function humanizeColumn(col: TopSheetColumn): string {
  switch (col) {
    case 'x':
      return 'multiplier';
    default:
      return col;
  }
}

/** Escape a CSV cell (basic RFC4180-friendly escaping). */
function csvEscape(value: string): string {
  // Escape double quotes and wrap in quotes if the value contains special chars
  const mustQuote = /[",\n]/.test(value);
  let out = value.replace(/"/g, '""');
  if (mustQuote) out = `"${out}"`;
  return out;
}

/**
 * Normalize string cells (avoid null/undefined in CSV).
 */
function safeCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

/**
 * Format numeric totals. For CSV, raw numbers are usually best; you can customize here.
 */
function formatNumber(value: unknown): string {
  // Accept native numbers
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  // Accept numeric strings (some backends serialize money as strings)
  if (typeof value === 'string') {
    const num = Number(value);
    if (Number.isFinite(num)) return String(num);
  }
  // Fall back to empty for invalid numbers
  return '';
}

/**
 * Example usage (pseudo-code):
 *
 * import { Saturation } from '@saturation-api/js';
 * import { fetchBudgetTopSheet, budgetTopSheetToCsv } from './budgetCsv';
 *
 * const client = new Saturation({ apiKey: 'sk_...' });
 * const budget = await fetchBudgetTopSheet(client, 'my-project');
 * const csv = budgetTopSheetToCsv(budget);
 * console.log(csv);
 */
