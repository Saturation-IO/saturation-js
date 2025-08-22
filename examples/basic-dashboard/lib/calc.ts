/**
 * Calculation Utilities
 * Pure functions for metrics and chart data transformations
 */

import type { Budget, Actual, PurchaseOrder, BudgetLine } from '@saturation-api/js';
import { toMonthKey } from './format';

/**
 * KPI Metrics for dashboard cards
 */
export interface KPIMetrics {
  totalBudget: number;
  totalActuals: number;
  openCommitments: number;
  remaining: number;
  burnPercent: number;
}

/**
 * Calculate all KPI metrics from raw data
 * @param budget - Budget data with lines
 * @param actuals - Array of actual transactions
 * @param purchaseOrders - Array of purchase orders
 */
export function calcKpis(
  budget: Budget | null,
  actuals: Actual[],
  purchaseOrders: PurchaseOrder[]
): KPIMetrics {
  // Calculate total budget from working phase (fallback to estimate)
  const totalBudget = budget?.lines?.reduce((sum, line) => {
    const amount = line.phaseData?.working?.amount || 
                   line.phaseData?.estimate?.amount || 
                   0;
    return sum + amount;
  }, 0) || 0;

  // Sum all actuals
  const totalActuals = actuals.reduce((sum, actual) => sum + (actual.amount || 0), 0);

  // Calculate open commitments (approved, pending, draft POs)
  const openStatuses = ['approved', 'pending', 'draft'];
  const openCommitments = purchaseOrders
    .filter(po => openStatuses.includes(po.status))
    .reduce((sum, po) => sum + (po.remaining || po.total || 0), 0);

  // Calculate remaining budget
  const remaining = totalBudget - (totalActuals + openCommitments);

  // Calculate burn percentage
  const burnPercent = totalBudget > 0 ? (totalActuals / totalBudget) * 100 : 0;

  return {
    totalBudget,
    totalActuals,
    openCommitments,
    remaining,
    burnPercent
  };
}

/**
 * Transform data for Budget vs Actuals by Account chart
 */
export function toBudgetVsActuals(budget: Budget | null, actuals: Actual[]) {
  // Group budget by account
  const budgetByAccount: Record<string, number> = {};
  budget?.lines?.forEach(line => {
    const account = line.accountId || 'Uncategorized';
    const amount = line.phaseData?.working?.amount || 
                   line.phaseData?.estimate?.amount || 0;
    budgetByAccount[account] = (budgetByAccount[account] || 0) + amount;
  });

  // Group actuals by account
  const actualsByAccount: Record<string, number> = {};
  actuals.forEach(actual => {
    const account = actual.accountId || 'Uncategorized';
    actualsByAccount[account] = (actualsByAccount[account] || 0) + (actual.amount || 0);
  });

  // Combine accounts and create chart data
  const allAccounts = new Set([...Object.keys(budgetByAccount), ...Object.keys(actualsByAccount)]);
  
  return Array.from(allAccounts).map(account => ({
    account: account.length > 20 ? account.substring(0, 20) + '...' : account,
    budget: budgetByAccount[account] || 0,
    actual: actualsByAccount[account] || 0
  })).sort((a, b) => (b.budget + b.actual) - (a.budget + a.actual)); // Sort by total amount
}

/**
 * Transform actuals for cumulative spend chart
 */
export function toSpendSeries(
  actuals: Actual[], 
  budgetTotal: number,
  projectStart?: string,
  projectEnd?: string
) {
  // Sort actuals by date
  const sorted = [...actuals].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate cumulative spend
  let cumulative = 0;
  const spendData = sorted.map(actual => {
    cumulative += actual.amount || 0;
    return {
      date: new Date(actual.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      actual: cumulative,
      budget: budgetTotal // Flat line for now - could be prorated
    };
  });

  // Add starting point if no data
  if (spendData.length === 0) {
    spendData.push({
      date: 'Start',
      actual: 0,
      budget: budgetTotal
    });
  }

  return spendData;
}

/**
 * Transform POs for status breakdown pie chart
 */
export function toPoStatusData(purchaseOrders: PurchaseOrder[]) {
  // Group by status
  const byStatus: Record<string, number> = {};
  
  purchaseOrders.forEach(po => {
    const status = po.status || 'unknown';
    byStatus[status] = (byStatus[status] || 0) + (po.total || 0);
  });

  // Convert to chart format
  return Object.entries(byStatus).map(([status, value]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value
  }));
}

/**
 * Calculate top vendors from actuals and POs
 */
export function toTopVendors(actuals: Actual[], purchaseOrders: PurchaseOrder[], limit = 10) {
  const vendorTotals: Record<string, number> = {};

  // Sum actuals by contact/vendor
  actuals.forEach(actual => {
    const vendor = actual.contact?.name || actual.contactId || 'Unknown';
    vendorTotals[vendor] = (vendorTotals[vendor] || 0) + (actual.amount || 0);
  });

  // Add PO amounts
  purchaseOrders.forEach(po => {
    const vendor = po.contact?.name || po.contactId || 'Unknown';
    vendorTotals[vendor] = (vendorTotals[vendor] || 0) + (po.total || 0);
  });

  // Sort and limit
  return Object.entries(vendorTotals)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

/**
 * Cashflow data structure
 */
export interface CashflowData {
  months: string[];
  accounts: string[];
  data: {
    account: string;
    months: {
      month: string;
      budget: number;
      actual: number;
    }[];
  }[];
}

/**
 * Generate cashflow matrix for table
 */
export function toCashflowMatrix(budget: Budget | null, actuals: Actual[]): CashflowData {
  // Group budget lines by month and account
  const budgetByMonthAccount: Record<string, Record<string, number>> = {};
  
  budget?.lines?.forEach(line => {
    // Use line.date for timing, fallback to createdAt
    const date = line.date || line.createdAt;
    if (!date) return;
    
    const month = toMonthKey(date);
    const account = line.topsheetAccount || line.accountId || 'Other';
    
    if (!budgetByMonthAccount[month]) {
      budgetByMonthAccount[month] = {};
    }
    
    const amount = line.phaseData?.working?.amount || 
                   line.phaseData?.estimate?.amount || 0;
    
    budgetByMonthAccount[month][account] = 
      (budgetByMonthAccount[month][account] || 0) + amount;
  });
  
  // Group actuals by month and account
  const actualsByMonthAccount: Record<string, Record<string, number>> = {};
  
  actuals.forEach(actual => {
    const month = toMonthKey(actual.date);
    if (!month) return; // Skip if date is invalid
    
    const account = actual.topsheetAccount || actual.accountId || 'Uncategorized';
    
    if (!actualsByMonthAccount[month]) {
      actualsByMonthAccount[month] = {};
    }
    
    actualsByMonthAccount[month][account] = 
      (actualsByMonthAccount[month][account] || 0) + (actual.amount || 0);
  });
  
  // Get all unique months and accounts
  const allMonths = [...new Set([
    ...Object.keys(budgetByMonthAccount),
    ...Object.keys(actualsByMonthAccount)
  ])].filter(month => month).sort(); // Filter out empty month keys
  
  const allAccounts = [...new Set([
    ...Object.values(budgetByMonthAccount).flatMap(Object.keys),
    ...Object.values(actualsByMonthAccount).flatMap(Object.keys)
  ])].sort();
  
  // Ensure "Uncategorized" appears last if it exists
  const uncategorizedIndex = allAccounts.indexOf('Uncategorized');
  if (uncategorizedIndex > -1) {
    allAccounts.splice(uncategorizedIndex, 1);
    allAccounts.push('Uncategorized');
  }
  
  // Build matrix data
  return {
    months: allMonths,
    accounts: allAccounts,
    data: allAccounts.map(account => ({
      account,
      months: allMonths.map(month => ({
        month,
        budget: budgetByMonthAccount[month]?.[account] || 0,
        actual: actualsByMonthAccount[month]?.[account] || 0
      }))
    }))
  };
}