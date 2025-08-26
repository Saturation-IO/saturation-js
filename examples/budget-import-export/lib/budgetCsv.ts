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
    expands: ['phases'],
    idMode: 'user',
  });
  return budget;
}

/**
 * CSV options to control how topsheet lines are exported.
 */
export type BudgetCsvOptions = {
  /**
   * Which line types to include in the CSV (default: line, account, subtotal)
   */
  includeLineTypes?: Array<'line' | 'account' | 'subtotal' | 'markup' | 'fringes'>;
  /**
   * Include a header row (default: true)
   */
  includeHeaders?: boolean;
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
  const { includeHeaders = true, includeLineTypes = ['line', 'account', 'subtotal'] } = options;

  const phases: Phase[] = budget.phases ?? [];
  const lines = budget.account?.lines ?? [];

  // Build header
  const headers = ['type', 'accountId', 'description', ...phases.map((p) => p.alias)];

  const rows: string[][] = [];
  if (includeHeaders) {
    rows.push(headers);
  }

  for (const line of lines) {
    if (!includeLineTypes.includes(line.type)) continue;

    const base = [
      safeCell(line.type),
      safeCell(line.accountId ?? ''),
      safeCell(line.description ?? ''),
    ];

    // Map totals for each phase (in the order of budget.phases)
    const phaseTotals = phases.map((phase) => formatNumber(line.totals?.[phase.id] ?? 0));

    rows.push([...base, ...phaseTotals]);
  }

  return rows.map((r) => r.map(csvEscape).join(',')).join('\n');
}

// --- helpers ----------------------------------------------------------------

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
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
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

