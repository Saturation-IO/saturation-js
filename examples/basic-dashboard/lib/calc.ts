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
 */
export function toBudgetVsActuals(budget: Budget | null, actuals: Actual[]) {
  // Group budget by account (using estimate totals from each line)
  const budgetByAccount: Record<string, number> = {};
  budget?.account?.lines?.forEach(line => {
    const account = line.accountId || 'Uncategorized';
    // Each line has its own totals object with estimate
    const amount = line.totals?.estimate || 0;
    if (amount > 0) {
      budgetByAccount[account] = (budgetByAccount[account] || 0) + amount;
    }
  });

  // Group actuals by account
  const actualsByAccount: Record<string, number> = {};
  actuals.forEach(actual => {
    // Actual has an account object with accountId
    const account = actual.account?.accountId || 'Uncategorized';
    actualsByAccount[account] = (actualsByAccount[account] || 0) + (actual.amount || 0);
  });

  // Combine accounts from both budget and actuals
  const allAccounts = [...new Set([...Object.keys(budgetByAccount), ...Object.keys(actualsByAccount)])];
  
  // Build chart data
  return allAccounts.map(account => ({
    account,
    budget: budgetByAccount[account] || 0,
    actual: actualsByAccount[account] || 0
  })).sort((a, b) => b.budget - a.budget); // Sort by budget descending
}

/**
 * Transform actuals into cumulative spend time series
 * @param actuals - List of actual expenses
 * @param budgetTotal - Total budget amount
 */
export function toSpendSeries(actuals: Actual[], budgetTotal: number) {
  // Sort actuals by date
  const sortedActuals = [...actuals].sort((a, b) => {
    const dateA = a.date ? new Date(a.date) : new Date(0);
    const dateB = b.date ? new Date(b.date) : new Date(0);
    return dateA.getTime() - dateB.getTime();
  });

  // Build cumulative spend data
  let cumulative = 0;
  const spendData = sortedActuals.map(actual => {
    cumulative += actual.amount || 0;
    const date = actual.date ? new Date(actual.date) : new Date();
    return {
      date: formatMonth(date.toISOString().slice(0, 7)),
      actual: cumulative,
      budget: budgetTotal
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
 * Transform budget and actuals into cashflow matrix
 * Groups by month and account for tabular display
 */
export function toCashflowMatrix(
  budget: Budget | null, 
  actuals: Actual[]
): {
  months: string[];
  accounts: string[];
  data: Array<{
    account: string;
    months: Array<{
      month: string;
      budget: number;
      actual: number;
    }>;
  }>;
} {
  // Group budget lines by month and account
  const budgetByMonthAccount: Record<string, Record<string, number>> = {};
  
  // For cashflow, we'll use the current month since budget lines don't have dates
  const currentMonth = toMonthKey(new Date());
  
  budget?.account?.lines?.forEach(line => {
    const account = line.accountId || 'Other';
    const amount = line.totals?.estimate || 0;
    
    if (amount > 0) {
      if (!budgetByMonthAccount[currentMonth]) {
        budgetByMonthAccount[currentMonth] = {};
      }
      
      budgetByMonthAccount[currentMonth][account] = 
        (budgetByMonthAccount[currentMonth][account] || 0) + amount;
    }
  });
  
  // Group actuals by month and account
  const actualsByMonthAccount: Record<string, Record<string, number>> = {};
  
  actuals.forEach(actual => {
    const month = toMonthKey(actual.date);
    if (!month) return; // Skip if date is invalid
    
    const account = actual.account?.topsheetAccount || actual.account?.accountId || 'Uncategorized';
    
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
  const data = allAccounts.map(account => ({
    account,
    months: allMonths.map(month => ({
      month,
      budget: budgetByMonthAccount[month]?.[account] || 0,
      actual: actualsByMonthAccount[month]?.[account] || 0
    }))
  }));
  
  return {
    months: allMonths,
    accounts: allAccounts,
    data
  };
}