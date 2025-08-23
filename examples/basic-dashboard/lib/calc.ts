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
 * @param phaseAlias - The phase alias to use for budget totals
 */
export function calcKpis(
  budget: Budget | null,
  actuals: Actual[],
  purchaseOrders: PurchaseOrder[],
  phaseAlias: string = 'estimate'
): KPIMetrics {
  // Get total budget from the account totals for the selected phase
  const totalBudget = budget?.account?.totals?.[phaseAlias] || 0;

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
 * @param budget - The project budget data
 * @param phaseAlias - The phase alias to use for budget totals
 */
export function toBudgetVsActuals(budget: Budget, phaseAlias: string = 'estimate') {
  // Map each line directly since accountIds are unique
  return budget.account.lines
    .map(line => {
      // Format as "AccountId - Description"
      const accountId = line.accountId || '';
      const description = line.description || '';
      const displayName = accountId && description 
        ? `${accountId} - ${description}` 
        : description || accountId || 'Uncategorized';
      
      return {
        account: displayName,
        estimate: line.totals?.[phaseAlias] || 0,
        actual: line.totals?.actual || 0
      };
    })
    .filter(item => item.estimate > 0 || item.actual > 0) // Only include lines with values
    .sort((a, b) => b.estimate - a.estimate); // Sort by estimate descending
}

/**
 * Transform actuals into cumulative spend time series
 * @param actuals - List of actual expenses
 * @param budgetTotal - Total budget amount for the selected phase
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
  // Group by status, excluding cancelled and merging waiting statuses
  const byStatus: Record<string, number> = {};
  
  purchaseOrders.forEach(po => {
    const status = po.status || 'unknown';
    
    // Skip cancelled POs
    if (status.toLowerCase() === 'cancelled') {
      return;
    }
    
    // Merge all waiting/pending statuses into "Waiting"
    let groupedStatus: string = status;
    if (status.toLowerCase() === 'pending' || 
        status.toLowerCase() === 'waiting' || 
        status.toLowerCase() === 'waitingapproval' ||
        status.toLowerCase() === 'waiting_approval') {
      groupedStatus = 'waiting';
    }
    
    byStatus[groupedStatus] = (byStatus[groupedStatus] || 0) + (po.amount || 0);
  });

  // Convert to chart format
  return Object.entries(byStatus).map(([status, value]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value
  }));
}

/**
 * Calculate top contacts from actuals only
 */
export function toTopContacts(actuals: Actual[], limit = 10) {
  const contactTotals: Record<string, { name: string; amount: number }> = {};

  // Sum actuals by contact ID
  actuals.forEach(actual => {
    if (actual.contact?.id && actual.contact?.name) {
      const contactId = actual.contact.id;
      if (!contactTotals[contactId]) {
        contactTotals[contactId] = {
          name: actual.contact.name,
          amount: 0
        };
      }
      contactTotals[contactId].amount += (actual.amount || 0);
    }
  });
  
  // Convert to array and sort by total descending
  const contacts = Object.values(contactTotals)
    .map(({ name, amount }) => ({ 
      contact: name, 
      amount 
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);

  return contacts;
}

/**
 * Transform actuals into cashflow matrix
 * Groups by month and top-level account for tabular display
 */
export function toCashflowMatrix(
  actuals: Actual[],
  budget: Budget
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
  const topLevelDescriptions: Record<string, string> = {};
  
  // Build top-level account descriptions from budget
  // Format as "AccountID - Description"
  budget.account.lines.forEach(line => {
    const pathParts = line.path.split('/').filter(p => p);
    if (pathParts.length === 1) {
      // This is a top-level account
      const topLevelId = pathParts[0];
      const accountId = line.accountId || topLevelId;
      const description = line.description || '';
      topLevelDescriptions[topLevelId] = `${accountId} - ${description}`;
    }
  });
  
  // Group actuals by month and top-level account
  const actualsByMonthAccount: Record<string, Record<string, number>> = {};
  
  actuals.forEach(actual => {
    const month = toMonthKey(actual.date);
    if (!month) return; // Skip if date is invalid
    
    // Get the top-level account from the path (first item split by '/')
    const accountPath = actual.account?.path || '';
    const pathParts = accountPath.split('/').filter(p => p); // Remove empty strings
    const topLevelAccount = pathParts[0] || 'Uncategorized';
    
    if (!actualsByMonthAccount[month]) {
      actualsByMonthAccount[month] = {};
    }
    
    actualsByMonthAccount[month][topLevelAccount] = 
      (actualsByMonthAccount[month][topLevelAccount] || 0) + (actual.amount || 0);
  });
  
  // Get all unique months and top-level accounts
  const allMonths = [...new Set(Object.keys(actualsByMonthAccount))].filter(month => month).sort();
  
  const allTopLevelAccounts = [...new Set(
    Object.values(actualsByMonthAccount).flatMap(Object.keys)
  )].sort();
  
  // Ensure "Uncategorized" appears last if it exists
  const uncategorizedIndex = allTopLevelAccounts.indexOf('Uncategorized');
  if (uncategorizedIndex > -1) {
    allTopLevelAccounts.splice(uncategorizedIndex, 1);
    allTopLevelAccounts.push('Uncategorized');
  }
  
  // Build matrix data with display names
  const data = allTopLevelAccounts.map(topLevel => ({
    account: topLevelDescriptions[topLevel] || topLevel, // Display description or fall back to top-level key
    months: allMonths.map(month => ({
      month,
      amount: actualsByMonthAccount[month]?.[topLevel] || 0
    }))
  }));
  
  // Return display names for accounts
  const displayAccounts = allTopLevelAccounts.map(key => topLevelDescriptions[key] || key);
  
  return {
    months: allMonths,
    accounts: displayAccounts,
    data
  };
}