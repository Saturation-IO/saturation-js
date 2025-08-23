/**
 * Budget and Financial Calculation Utilities
 * Helper functions for calculating KPIs and transforming data for charts
 */

import { formatMonth, toMonthKey } from './format';
import type { Budget, BudgetLine, BudgetLineItem, Actual, PurchaseOrder } from '@saturation-api/js';

/**
 * KPI Metrics type
 */
export interface KPIMetrics {
  totalBudget: number;
  totalActuals: number;
  openCommitments: number;
  remaining: number;
  burnPercent: number;
}

/**
 * Calculate Key Performance Indicators
 * @param budget - The project budget data
 * @param actuals - List of actual expenses
 * @param purchaseOrders - List of purchase orders
 */
export function calcKpis(
  budget: Budget | null,
  actuals: Actual[],
  purchaseOrders: PurchaseOrder[]
): KPIMetrics {
  console.log(JSON.stringify(budget?.account?.totals, null, 2));
  // Get total budget from the account totals (estimate phase)
  const totalBudget = budget?.account?.totals?.estimate || 0;

  // Sum all actuals
  const totalActuals = actuals.reduce((sum, actual) => sum + (actual.amount || 0), 0);

  // Calculate open commitments (approved, pending, draft POs)
  // PurchaseOrder has amount (total) and paidAmount fields
  const openStatuses = ['approved', 'pending', 'draft'];
  const openCommitments = purchaseOrders
    .filter(po => openStatuses.includes(po.status))
    .reduce((sum, po) => sum + (po.amount - po.paidAmount), 0);

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
 * Uses the totals from budget lines (both estimate and actual)
 */
export function toBudgetVsActuals(budget: Budget) {
  // Map each line directly since accountIds are unique
  return budget.account.lines
    .map(line => ({
      account: line.description || line.accountId || 'Uncategorized',
      estimate: line.totals?.estimate || 0,
      actual: line.totals?.actual || 0
    }))
    .filter(item => item.estimate > 0 || item.actual > 0) // Only include lines with values
    .sort((a, b) => b.estimate - a.estimate); // Sort by estimate descending
}

/**
 * Transform actuals into cumulative spend time series
 * @param actuals - List of actual expenses
 * @param budgetTotal - Total budget amount
 * @param maxDataPoints - Maximum number of data points to show (default: 20)
 */
export function toSpendSeries(actuals: Actual[], budgetTotal: number, maxDataPoints: number = 20) {
  // Sort actuals by date
  const sortedActuals = [...actuals].sort((a, b) => {
    const dateA = a.date ? new Date(a.date) : new Date(0);
    const dateB = b.date ? new Date(b.date) : new Date(0);
    return dateA.getTime() - dateB.getTime();
  });

  // Build cumulative spend data
  let cumulative = 0;
  const allData = sortedActuals.map(actual => {
    cumulative += actual.amount || 0;
    const date = actual.date ? new Date(actual.date) : new Date();
    return {
      date: formatMonth(date.toISOString().slice(0, 7)),
      actual: cumulative,
      budget: budgetTotal
    };
  });

  // Add starting point if no data
  if (allData.length === 0) {
    return [{
      date: 'Start',
      actual: 0,
      budget: budgetTotal
    }];
  }

  // If we have fewer data points than the max, return all
  if (allData.length <= maxDataPoints) {
    return allData;
  }

  // Sample the data to get evenly distributed points
  const sampledData = sampleDataPoints(allData, maxDataPoints);
  
  return sampledData;
}

/**
 * Sample data points to reduce the number while preserving the overall trend
 * Always includes first and last points
 * @param data - Full dataset
 * @param targetCount - Target number of data points
 */
function sampleDataPoints<T>(data: T[], targetCount: number): T[] {
  if (data.length <= targetCount) {
    return data;
  }

  const sampled: T[] = [];
  const step = (data.length - 1) / (targetCount - 1);
  
  // Always include the first point
  sampled.push(data[0]);
  
  // Sample intermediate points
  for (let i = 1; i < targetCount - 1; i++) {
    const index = Math.round(i * step);
    sampled.push(data[index]);
  }
  
  // Always include the last point
  sampled.push(data[data.length - 1]);
  
  return sampled;
}

/**
 * Transform POs for status breakdown pie chart
 */
export function toPoStatusData(purchaseOrders: PurchaseOrder[]) {
  // Group by status
  const byStatus: Record<string, number> = {};
  
  purchaseOrders.forEach(po => {
    const status = po.status || 'unknown';
    byStatus[status] = (byStatus[status] || 0) + (po.amount || 0);
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
    if (actual.contact?.name) {
      vendorTotals[actual.contact.name] = (vendorTotals[actual.contact.name] || 0) + (actual.amount || 0);
    }
  });

  // Sum POs by contact/vendor
  purchaseOrders.forEach(po => {
    if (po.contact?.name) {
      vendorTotals[po.contact.name] = (vendorTotals[po.contact.name] || 0) + (po.amount || 0);
    }
  });

  // Convert to array and sort by total descending
  const vendors = Object.entries(vendorTotals)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);

  return vendors;
}

/**
 * Transform actuals into cashflow matrix
 * Groups by month and account for tabular display
 */
export function toCashflowMatrix(
  actuals: Actual[]
): {
  months: string[];
  accounts: string[];
  data: Array<{
    account: string;
    months: Array<{
      month: string;
      amount: number;
    }>;
  }>;
} {
  const accountDescriptions: Record<string, string> = {};
  
  // Group actuals by month and account
  const actualsByMonthAccount: Record<string, Record<string, number>> = {};
  
  actuals.forEach(actual => {
    const month = toMonthKey(actual.date);
    if (!month) return; // Skip if date is invalid
    
    const accountId = actual.account?.accountId || 'Uncategorized';
    // Store description if we haven't seen this account before
    if (actual.account?.accountDescription) {
      accountDescriptions[accountId] = actual.account.accountDescription;
    }
    
    if (!actualsByMonthAccount[month]) {
      actualsByMonthAccount[month] = {};
    }
    
    actualsByMonthAccount[month][accountId] = 
      (actualsByMonthAccount[month][accountId] || 0) + (actual.amount || 0);
  });
  
  // Get all unique months and accounts
  const allMonths = [...new Set(Object.keys(actualsByMonthAccount))].filter(month => month).sort();
  
  const allAccountIds = [...new Set(
    Object.values(actualsByMonthAccount).flatMap(Object.keys)
  )].sort();
  
  // Ensure "Uncategorized" appears last if it exists
  const uncategorizedIndex = allAccountIds.indexOf('Uncategorized');
  if (uncategorizedIndex > -1) {
    allAccountIds.splice(uncategorizedIndex, 1);
    allAccountIds.push('Uncategorized');
  }
  
  // Build matrix data with display names
  const data = allAccountIds.map(accountId => ({
    account: accountDescriptions[accountId] || accountId, // Display description or fall back to ID
    months: allMonths.map(month => ({
      month,
      amount: actualsByMonthAccount[month]?.[accountId] || 0
    }))
  }));
  
  // Return display names for accounts but keep IDs as keys internally
  const displayAccounts = allAccountIds.map(id => accountDescriptions[id] || id);
  
  return {
    months: allMonths,
    accounts: displayAccounts,
    data
  };
}