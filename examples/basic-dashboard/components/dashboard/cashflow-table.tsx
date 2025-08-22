'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatFullCurrency, formatMonth } from '@/lib/format';
import { toCashflowMatrix } from '@/lib/calc';
import type { Budget, Actual } from '@saturation-api/js';

interface CashflowTableProps {
  budget: Budget | null;
  actuals: Actual[];
}

export function CashflowTable({ budget, actuals }: CashflowTableProps) {
  // Generate cashflow matrix data
  const cashflow = toCashflowMatrix(budget, actuals);

  // Calculate totals for each month
  const monthTotals = cashflow.months.map(month => ({
    month,
    budgetTotal: cashflow.data.reduce((sum, account) => {
      const monthData = account.months.find(m => m.month === month);
      return sum + (monthData?.budget || 0);
    }, 0),
    actualTotal: cashflow.data.reduce((sum, account) => {
      const monthData = account.months.find(m => m.month === month);
      return sum + (monthData?.actual || 0);
    }, 0)
  }));

  // Calculate account totals
  const accountTotals = cashflow.data.map(account => ({
    account: account.account,
    budgetTotal: account.months.reduce((sum, m) => sum + m.budget, 0),
    actualTotal: account.months.reduce((sum, m) => sum + m.actual, 0)
  }));

  // Grand totals
  const grandTotals = {
    budget: monthTotals.reduce((sum, m) => sum + m.budgetTotal, 0),
    actual: monthTotals.reduce((sum, m) => sum + m.actualTotal, 0)
  };

  if (cashflow.months.length === 0 || cashflow.accounts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Cashflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No cashflow data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Cashflow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2 font-medium">Account</th>
                {cashflow.months.map(month => (
                  <th key={month} className="text-right py-2 px-2 font-medium min-w-[100px]">
                    {formatMonth(month)}
                  </th>
                ))}
                <th className="text-right py-2 px-2 font-medium min-w-[100px] border-l">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {cashflow.data.map((accountData, idx) => {
                const accountTotal = accountTotals.find(a => a.account === accountData.account);
                return (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-2 font-medium">
                      {accountData.account}
                    </td>
                    {accountData.months.map((monthData) => {
                      const hasVariance = monthData.actual !== monthData.budget;
                      return (
                        <td key={monthData.month} className="text-right py-2 px-2">
                          <div className="space-y-1">
                            <div className="text-gray-600">
                              {formatFullCurrency(monthData.budget)}
                            </div>
                            <div className={hasVariance ? 'text-green-600 font-medium' : 'text-gray-400'}>
                              {formatFullCurrency(monthData.actual)}
                            </div>
                          </div>
                        </td>
                      );
                    })}
                    <td className="text-right py-2 px-2 border-l">
                      <div className="space-y-1">
                        <div className="text-gray-600">
                          {formatFullCurrency(accountTotal?.budgetTotal || 0)}
                        </div>
                        <div className="text-green-600 font-medium">
                          {formatFullCurrency(accountTotal?.actualTotal || 0)}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 font-bold">
                <td className="py-2 px-2">Total</td>
                {monthTotals.map((monthTotal) => (
                  <td key={monthTotal.month} className="text-right py-2 px-2">
                    <div className="space-y-1">
                      <div className="text-gray-600">
                        {formatFullCurrency(monthTotal.budgetTotal)}
                      </div>
                      <div className="text-green-600">
                        {formatFullCurrency(monthTotal.actualTotal)}
                      </div>
                    </div>
                  </td>
                ))}
                <td className="text-right py-2 px-2 border-l">
                  <div className="space-y-1">
                    <div className="text-gray-600">
                      {formatFullCurrency(grandTotals.budget)}
                    </div>
                    <div className="text-green-600">
                      {formatFullCurrency(grandTotals.actual)}
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
          <div className="mt-4 text-xs text-gray-500">
            <p>• Top row (gray): Budget amounts</p>
            <p>• Bottom row (green): Actual amounts</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}