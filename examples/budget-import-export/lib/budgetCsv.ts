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
  | 'x'
  | 'overtime';

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
    includeLineTypes = ['line', 'account', 'subtotal', 'markup'],
    columns = ['id', 'description'],
    phases: phaseAliases,
  } = options;

  const allPhases: Phase[] = budget.phases ?? [];
  // Resolve phases strictly by alias (user mode) and preserve order
  const phases: Phase[] = Array.isArray(phaseAliases) && phaseAliases.length
    ? phaseAliases.map((alias) => allPhases.find((p) => p.alias === alias)).filter((p): p is Phase => Boolean(p))
    : allPhases;
  const lines = budget.account?.lines ?? [];
  const subAccounts = budget.subAccounts ? Object.values(budget.subAccounts) : [];
  const byAccountId = new Map<string, Account>();
  for (const acc of subAccounts) {
    if (acc.accountId) byAccountId.set(acc.accountId, acc);
  }

  // Partition selected columns into global vs phase-scoped
  const phaseScoped: BudgetColumn[] = columns.filter((c): c is BudgetColumn => PHASE_SCOPED_BUDGET_COLUMNS.has(c as BudgetColumn));
  const globalCols: BudgetColumn[] = columns.filter((c): c is BudgetColumn => GLOBAL_BUDGET_COLUMNS.has(c as BudgetColumn));
  // Inspect all included lines to determine per-phase visibility for fringe columns
  const linesForPhaseScopedColumns = collectLinesForPhaseScopedColumns(
    budget.account,
    subAccounts,
    byAccountId,
    includeLineTypes
  );
  const fringeUsageByPhase = computePhaseFringeUsage(phases, linesForPhaseScopedColumns);
  const phaseScopedByPhase: BudgetColumn[][] = phases.map((phase) =>
    phase.type?.toLowerCase() === 'estimate'
      ? phaseScoped.filter((col) => shouldIncludePhaseScopedColumn(col, phase, fringeUsageByPhase))
      : []
  );

  // Build headers: global columns first, then for each phase add Total and any selected phase-scoped subcolumns
  const headers: string[] = [];
  headers.push(...globalCols);
  phases.forEach((phase, index) => {
    const alias = phase.alias ?? phase.id;
    const label = alias;
    const scopedCols = phaseScopedByPhase[index] ?? [];
    for (const col of scopedCols) {
      headers.push(`${label} ${humanizeColumn(col)}`);
    }
    headers.push(`${label} total`);
  });

  // Build a function to create a CSV table (rows) for a list of lines
  const buildRowsForLines = (
    srcLines: BudgetLine[],
    indentSpaces = 0,
    addTotalsRow = false,
    overrideTotalsByPhase?: Record<string, number>,
    fringeLinesOverride?: BudgetLine[],
    fringesLabel?: string
  ): string[][] => {
    const out: string[][] = [];
    if (includeHeaders) out.push(headers);
    const eligibleLines = srcLines.filter((line) => includeLineTypes.includes(line.type));
    const fringeLines = fringeLinesOverride ?? srcLines.filter((line) => line.type === 'fringes');
    for (const line of eligibleLines) {
      out.push(buildRowForLine(line, phases, globalCols, phaseScopedByPhase, indentSpaces));
    }
    if (addTotalsRow && phases.length > 0) {
      const totalLines = selectLinesForTotals(eligibleLines);
      const fringesRow = buildFringesTotalsRow(
        fringeLines,
        phases,
        globalCols,
        phaseScopedByPhase,
        indentSpaces,
        fringesLabel ?? 'Fringes Total'
      );
      if (fringesRow) out.push(fringesRow);
      const totalsRow = buildTotalsRow(
        totalLines,
        phases,
        globalCols,
        phaseScopedByPhase,
        indentSpaces,
        overrideTotalsByPhase
      );
      if (totalsRow) out.push(totalsRow);
    }
    return out;
  };

  // Root table (top-level)
  const tables: string[][][] = [];
  tables.push(
    buildRowsForLines(
      lines,
      0,
      true,
      budget.account?.totals,
      lines.filter((line) => line.type === 'fringes'),
      formatFringesTotalLabel(budget.account)
    )
  );

  // Identify second-level accounts (direct children of root) by path depth
  const secondLevelAccounts = subAccounts.filter((acc) => pathDepth(acc.path) === 1);

  // For each second-level account, create its own table. Inline third-level children as subrows.
  for (const acc of secondLevelAccounts) {
    const rows: string[][] = [];
    const accountTotalsCandidates: BudgetLine[] = [];
    const accountFringeLines = acc.lines.filter((line) => line.type === 'fringes');
    // Table title row (omit per-table headers)
    const title = `Account ${acc.accountId ?? acc.id}${acc.description ? ` - ${acc.description}` : ''}`;
    rows.push([title, ...Array(Math.max(0, headers.length - 1)).fill('')]);
    let dataRowCount = 0;
    for (const line of acc.lines) {
      if (!includeLineTypes.includes(line.type)) continue;
      // Parent row (no indent)
      rows.push(buildRowForLine(line, phases, globalCols, phaseScopedByPhase, 0));
      dataRowCount++;
      accountTotalsCandidates.push(line);
      // If this is an account line, inline its child account's lines with indent
      if (line.type === 'account' && line.accountId) {
        const childAcc = byAccountId.get(line.accountId);
        const childTotalsCandidates: BudgetLine[] = [];
        const childFringeLines = childAcc?.lines
          ? childAcc.lines.filter((subLine) => subLine.type === 'fringes')
          : [];
        if (childAcc && Array.isArray(childAcc.lines) && childAcc.lines.length) {
          for (const subLine of childAcc.lines) {
            if (!includeLineTypes.includes(subLine.type)) continue;
            rows.push(buildRowForLine(subLine, phases, globalCols, phaseScopedByPhase, 4));
            dataRowCount++;
            childTotalsCandidates.push(subLine);
          }
        }
        const childFringeTotalsRow = buildFringesTotalsRow(
          childFringeLines,
          phases,
          globalCols,
          phaseScopedByPhase,
          4,
          formatFringesTotalLabel(childAcc)
        );
        if (childFringeTotalsRow) {
          rows.push(childFringeTotalsRow);
        }
        const childTotalsRow = buildTotalsRow(
          selectLinesForTotals(childTotalsCandidates),
          phases,
          globalCols,
          phaseScopedByPhase,
          4,
          childAcc?.totals as Record<string, number> | undefined
        );
        if (childTotalsRow) {
          rows.push(childTotalsRow);
        }
      }
    }
    // Skip empty tables (no data rows after filtering)
    if (dataRowCount > 0) {
      const accountFringesRow = buildFringesTotalsRow(
        accountFringeLines,
        phases,
        globalCols,
        phaseScopedByPhase,
        0,
        formatFringesTotalLabel(acc)
      );
      if (accountFringesRow) {
        rows.push(accountFringesRow);
      }
      const accountTotalsRow = buildTotalsRow(
        selectLinesForTotals(accountTotalsCandidates),
        phases,
        globalCols,
        phaseScopedByPhase,
        0,
        acc.totals as Record<string, number> | undefined
      );
      if (accountTotalsRow) {
        rows.push(accountTotalsRow);
      }
      tables.push(rows);
    }
  }

  // Convert tables to CSV and separate by two blank rows
  const tableCsvs = tables.map((rows) => rows.map((r) => r.map(csvEscape).join(',')).join('\n'));
  return tableCsvs.join('\n\n\n');
}

// --- helpers ----------------------------------------------------------------

const GLOBAL_BUDGET_COLUMNS = new Set<BudgetColumn>(['id', 'description', 'tags', 'contact']);
const PHASE_SCOPED_BUDGET_COLUMNS = new Set<BudgetColumn>(['fringes', 'dates', 'quantity', 'rate', 'x', 'overtime']);

function selectLinesForTotals(lines: BudgetLine[]): BudgetLine[] {
  const typePriority: Array<BudgetLine['type']> = ['line', 'subtotal', 'account', 'markup', 'fringes'];
  for (const type of typePriority) {
    const subset = lines.filter((line) => line.type === type);
    if (subset.length) return subset;
  }
  return lines;
}

function buildTotalsRow(
  lines: BudgetLine[],
  phases: Phase[],
  globalCols: BudgetColumn[],
  phaseScopedColumnsPerPhase: BudgetColumn[][],
  indentSpaces: number,
  overrideTotalsByPhase?: Record<string, number>
): string[] | null {
  const base = buildTotalsLabelColumns(globalCols, indentSpaces);
  const aggregatedTotals = overrideTotalsByPhase ? undefined : aggregatePhaseTotals(lines, phases);
  const perPhaseCells: string[] = [];
  let hasTotals = false;
  phases.forEach((phase, index) => {
    const key = phase.alias || phase.id;
    const total = key
      ? overrideTotalsByPhase?.[key] ?? aggregatedTotals?.get(key)
      : undefined;
    const formatted = formatNumber(total);
    if (formatted !== '') hasTotals = true;
    const scopedCols = phaseScopedColumnsPerPhase[index] ?? [];
    for (const _ of scopedCols) {
      perPhaseCells.push('');
    }
    perPhaseCells.push(formatted);
  });
  if (!hasTotals) return null;
  return [...base, ...perPhaseCells];
}

function buildFringesTotalsRow(
  fringeLines: BudgetLine[],
  phases: Phase[],
  globalCols: BudgetColumn[],
  phaseScopedColumnsPerPhase: BudgetColumn[][],
  indentSpaces: number,
  label: string
): string[] | null {
  if (!fringeLines.length) return null;
  const aggregatedFringeTotals = aggregatePhaseFringeTotals(fringeLines, phases);
  if (aggregatedFringeTotals.size === 0) return null;
  const base = buildTotalsLabelColumns(globalCols, indentSpaces, label);
  const perPhaseCells: string[] = [];
  let hasTotals = false;
  phases.forEach((phase, index) => {
    const key = phase.alias || phase.id;
    const scopedCols = phaseScopedColumnsPerPhase[index] ?? [];
    for (const col of scopedCols) {
      perPhaseCells.push('');
    }
    const formattedTotal = key ? formatNumber(aggregatedFringeTotals.get(key)) : '';
    if (formattedTotal !== '') hasTotals = true;
    perPhaseCells.push(formattedTotal);
  });
  if (!hasTotals) return null;
  return [...base, ...perPhaseCells];
}

function buildTotalsLabelColumns(
  globalCols: BudgetColumn[],
  indentSpaces: number,
  label = 'TOTAL'
): string[] {
  const cells = globalCols.map((col) => {
    if (col === 'description') {
      return safeCell(`${' '.repeat(indentSpaces)}${label}`);
    }
    return '';
  });
  if (!globalCols.includes('description') && cells.length > 0) {
    cells[0] = safeCell(label);
  }
  return cells;
}

function aggregatePhaseTotals(lines: BudgetLine[], phases: Phase[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const phase of phases) {
    const key = phase.alias || phase.id;
    if (!key) continue;
    let running = 0;
    let hasValue = false;
    for (const line of lines) {
      const value = getLineTotalForPhase(line, phase);
      if (typeof value === 'number' && Number.isFinite(value)) {
        running += value;
        hasValue = true;
      }
    }
    if (hasValue) totals.set(key, running);
  }
  return totals;
}

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

function shouldIncludePhaseScopedColumn(
  column: BudgetColumn,
  phase: Phase,
  fringeUsageByPhase: Map<string, boolean>
): boolean {
  if (column === 'fringes') {
    if ((phase.type ?? '').toLowerCase() !== 'estimate') return false;
    const key = phase.alias || phase.id || '';
    if (!key) return false;
    return Boolean(fringeUsageByPhase.get(key));
  }
  return true;
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
      const startRaw = pd?.date?.startDate ?? '';
      const endRaw = pd?.date?.endDate ?? '';
      const start = formatIsoDate(startRaw);
      const end = formatIsoDate(endRaw);
      return start || end ? safeCell(`${start}..${end}`) : '';
    }
    case 'quantity':
      return formatNumber(pd?.quantity);
    case 'rate':
      return formatNumber(pd?.rate);
    case 'x':
      return formatNumber(pd?.multiplier);
    case 'overtime':
      return formatOvertime(pd?.overtime);
    default:
      return '';
  }
}

function buildRowForLine(
  line: BudgetLine,
  phases: Phase[],
  globalCols: BudgetColumn[],
  phaseScopedColumnsPerPhase: BudgetColumn[][],
  indentSpaces: number
): string[] {
  const base = buildGlobalColumnsForLine(line, globalCols, indentSpaces);
  const perPhaseCells: string[] = [];
  phases.forEach((phase, index) => {
    const phaseKey = phase.alias || phase.id || '';
    const scopedCols = phaseScopedColumnsPerPhase[index] ?? [];
    for (const col of scopedCols) {
      perPhaseCells.push(buildPhaseScopedCell(line, col, phaseKey));
    }
    perPhaseCells.push(formatNumber(getLineTotalForPhase(line, phase)));
  });
  return [...base, ...perPhaseCells];
}

function getLineTotalForPhase(line: BudgetLine, phase: Phase): number | undefined {
  const totals = line.totals as Record<string, number> | undefined;
  if (!totals) return undefined;
  const { alias, id } = phase;
  const entries = Object.entries(totals);
  if (alias) {
    if (alias in totals) return totals[alias];
    const normalized = alias.toLowerCase();
    const aliasEntry = entries.find(([key]) => key.toLowerCase() === normalized);
    if (aliasEntry) return aliasEntry[1];
  }
  if (id) {
    if (id in totals) return totals[id];
    const normalized = id.toLowerCase();
    const idEntry = entries.find(([key]) => key.toLowerCase() === normalized);
    if (idEntry) return idEntry[1];
  }
  // Handle cases where Actual phases come back without stable aliases by picking any actual-looking total.
  if (phase.type === 'actual') {
    const actualEntry = entries.find(([key, value]) => key.toLowerCase().includes('actual') && Number.isFinite(value));
    if (actualEntry) return actualEntry[1];
  }
  return undefined;
}

function humanizeColumn(col: BudgetColumn): string {
  return col === 'x' ? 'multiplier' : col;
}

function collectLinesForPhaseScopedColumns(
  rootAccount: Account | undefined,
  subAccounts: Account[],
  byAccountId: Map<string, Account>,
  includeLineTypes: Array<BudgetLine['type']>
): BudgetLine[] {
  const collected: BudgetLine[] = [];
  const seenLineIds = new Set<string>();
  const visitedAccountIds = new Set<string>();

  const visitAccount = (account?: Account) => {
    if (!account) return;
    if (visitedAccountIds.has(account.id)) return;
    visitedAccountIds.add(account.id);
    addLines(account.lines);
  };

  const addLines = (lineList: BudgetLine[] | undefined) => {
    if (!Array.isArray(lineList)) return;
    for (const line of lineList) {
      if (!includeLineTypes.includes(line.type) && line.type !== 'fringes') continue;
      if (!seenLineIds.has(line.id)) {
        seenLineIds.add(line.id);
        collected.push(line);
      }
      if (line.type === 'account' && line.accountId) {
        visitAccount(byAccountId.get(line.accountId));
      }
    }
  };

  visitAccount(rootAccount);
  for (const account of subAccounts) {
    visitAccount(account);
  }

  return collected;
}

function computePhaseFringeUsage(phases: Phase[], lines: BudgetLine[]): Map<string, boolean> {
  const usage = new Map<string, boolean>();
  for (const phase of phases) {
    const key = phase.alias || phase.id;
    if (!key) continue;
    if (phaseHasNonEmptyFringes(lines, phase)) {
      usage.set(key, true);
    }
  }
  return usage;
}

function phaseHasNonEmptyFringes(lines: BudgetLine[], phase: Phase): boolean {
  for (const line of lines) {
    if (lineHasNonEmptyFringes(line, phase)) return true;
  }
  return false;
}

function lineHasNonEmptyFringes(line: BudgetLine, phase: Phase): boolean {
  const phaseKey = phase.alias || phase.id || '';
  if (line.type === 'fringes') {
    const amount = getLineTotalForPhase(line, phase);
    if (typeof amount === 'number' && Number.isFinite(amount) && amount !== 0) {
      return true;
    }
  }
  if (!phaseKey) return false;
  const data = line.phaseData?.[phaseKey];
  if (!data) return false;
  if (typeof data.fringeTotal === 'number' && Number.isFinite(data.fringeTotal) && data.fringeTotal !== 0) {
    return true;
  }
  if (Array.isArray(data.fringes)) {
    return data.fringes.some((value) => typeof value === 'string' && value.trim().length > 0);
  }
  return false;
}

function aggregatePhaseFringeTotals(fringeLines: BudgetLine[], phases: Phase[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const phase of phases) {
    const key = phase.alias || phase.id;
    if (!key) continue;
    let running = 0;
    let hasNonZeroAmount = false;
    for (const line of fringeLines) {
      if (line.type !== 'fringes') continue;
      const amount = getLineTotalForPhase(line, phase);
      if (typeof amount === 'number' && Number.isFinite(amount)) {
        running += amount;
        if (amount !== 0) hasNonZeroAmount = true;
      }
    }
    if (hasNonZeroAmount && running !== 0) {
      totals.set(key, running);
    }
  }
  return totals;
}

function formatFringesTotalLabel(account?: Account): string {
  const description = account?.description?.trim();
  const fallback = description && description.length
    ? description
    : account?.accountId ?? account?.id ?? 'Top Sheet';
  return `${fallback} - Fringes Total`;
}

function formatIsoDate(value: string): string {
  if (!value) return '';
  const normalized = value.trim();
  if (!normalized) return '';
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return normalized;
  const year = parsed.getUTCFullYear();
  const month = String(parsed.getUTCMonth() + 1).padStart(2, '0');
  const day = String(parsed.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatOvertime(value: number | string | null | undefined): string {
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value <= 0) return '';
    return String(value);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return '';
    const num = Number(trimmed);
    if (!Number.isFinite(num) || num <= 0) return '';
    return String(num);
  }
  return '';
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
