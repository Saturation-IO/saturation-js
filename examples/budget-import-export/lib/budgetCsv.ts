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

import type { Budget, Phase, Saturation } from '@saturation-api/js';

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
  return budget;
}

/**
 * CSV options to control how topsheet lines are exported.
 */
type TopSheetColumn =
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
   * Limit phases to this set of phase IDs (order respected). Defaults to all budget phases.
   */
  phases?: string[];
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

  const allPhases: Phase[] = budget.phases ?? [];
  const phases: Phase[] = phaseFilter && phaseFilter.length
    ? allPhases.filter((p) => phaseFilter.includes(p.id))
    : allPhases;
  const lines = budget.account?.lines ?? [];

  // Build header from selected columns, then one column per selected phase
  const headers = [
    ...columns.map((c) => c),
    ...phases.map((p) => p.name ?? p.alias ?? ''),
  ];

  const rows: string[][] = [];
  if (includeHeaders) {
    rows.push(headers);
  }

  for (const line of lines) {
    if (!includeLineTypes.includes(line.type)) continue;

    const primaryPhaseId = phases[0]?.id || allPhases[0]?.id || '';
    const base = buildColumnsForLine(line as any, columns, primaryPhaseId);

    // Map totals for each phase (in the order of budget.phases)
    const phaseTotals = phases.map((phase) => formatNumber((line as any).totals?.[phase.id] ?? 0));

    rows.push([...base, ...phaseTotals]);
  }

  return rows.map((r) => r.map(csvEscape).join(',')).join('\n');
}

// --- helpers ----------------------------------------------------------------

function buildColumnsForLine(
  line: any,
  columns: TopSheetColumn[],
  primaryPhaseId: string
): string[] {
  return columns.map((col) => {
    switch (col) {
      case 'id':
        return safeCell(line.accountId ?? '');
      case 'description':
        return safeCell(line.description ?? '');
      case 'tags':
        return Array.isArray(line.tags) ? safeCell(line.tags.join('; ')) : '';
      case 'contact': {
        const contact = line.contact;
        return safeCell(contact?.name ?? contact?.company ?? '');
      }
      case 'notes':
        return safeCell(line.notes ?? '');
      case 'fringes': {
        const pd = line.phaseData?.[primaryPhaseId];
        const list = Array.isArray(pd?.fringes) ? pd.fringes : [];
        return safeCell(list.join('; '));
      }
      case 'dates': {
        const pd = line.phaseData?.[primaryPhaseId];
        const start = pd?.date?.startDate ?? '';
        const end = pd?.date?.endDate ?? '';
        return start || end ? safeCell(`${start}..${end}`) : '';
      }
      case 'quantity': {
        const q = line.phaseData?.[primaryPhaseId]?.quantity;
        return formatNumber(q);
      }
      case 'rate': {
        const r = line.phaseData?.[primaryPhaseId]?.rate;
        return formatNumber(r);
      }
      case 'x': {
        const m = line.phaseData?.[primaryPhaseId]?.multiplier;
        return formatNumber(m);
      }
      default:
        return '';
    }
  });
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
