/** CSV helpers: formatting and small utilities */

/** Escape a CSV cell (basic RFC4180-friendly escaping). */
export function csvEscape(value: string): string {
  const mustQuote = /[",\n]/.test(value);
  let out = value.replace(/"/g, '""');
  if (mustQuote) out = `"${out}` + '"';
  return out;
}

/** Normalize string cells (avoid null/undefined in CSV). */
export function safeCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

/** Format numeric cells: allow numbers or numeric strings; otherwise blank. */
export function formatNumber(value: number | string | null | undefined): string {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'string') {
    const num = Number(value);
    if (Number.isFinite(num)) return String(num);
  }
  return '';
}

/** Return the depth of an account path (segments separated by '/'). */
export function pathDepth(path: string): number {
  return path.split('/').filter(Boolean).length;
}

