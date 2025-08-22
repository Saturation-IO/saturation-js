/**
 * Formatting Utilities
 * Currency, number, and date formatting helpers
 */

/**
 * Format currency with K/M notation for large numbers
 * @param amount - The amount in cents or dollars
 * @param inCents - Whether the amount is in cents (default: false)
 */
export function formatCurrency(amount: number | null | undefined, inCents = false): string {
  if (amount == null) return '$0';
  
  const value = inCents ? amount / 100 : amount;
  
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  } else if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  } else {
    return `$${value.toFixed(0)}`;
  }
}

/**
 * Format number with K/M notation
 * @param num - The number to format
 */
export function formatShortNumber(num: number | null | undefined): string {
  if (num == null) return '0';
  
  if (Math.abs(num) >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  } else if (Math.abs(num) >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  } else {
    return num.toFixed(0);
  }
}

/**
 * Format percentage
 * @param value - The percentage value (0-100)
 */
export function formatPercent(value: number | null | undefined): string {
  if (value == null) return '0%';
  return `${value.toFixed(1)}%`;
}

/**
 * Format month for display (e.g., "Jan '24")
 * @param dateStr - Date string in YYYY-MM format
 */
export function formatMonth(dateStr: string): string {
  try {
    const [year, month] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      year: '2-digit' 
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format date to YYYY-MM for grouping
 * @param date - Date string or Date object
 */
export function toMonthKey(date: string | Date | null | undefined): string {
  if (!date) return '';
  
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (!d || isNaN(d.getTime())) {
      return '';
    }
    
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  } catch {
    return '';
  }
}

/**
 * Format full currency (no abbreviation)
 * @param amount - The amount to format
 */
export function formatFullCurrency(amount: number | null | undefined): string {
  if (amount == null) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}