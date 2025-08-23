'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatFullCurrency, formatMonth } from '@/lib/format';
import { toCashflowMatrix } from '@/lib/calc';
import type { Actual, Budget } from '@saturation-api/js';

interface CashflowTableProps {
  actuals: Actual[];
  budget: Budget;
}

export function CashflowTable({ actuals, budget }: CashflowTableProps) {
  // Generate cashflow matrix data
  const cashflow = toCashflowMatrix(actuals, budget);

  // Calculate totals for each month
  const monthTotals = cashflow.months.map(month => ({
    month,
    total: cashflow.data.reduce((sum, account) => {
      const monthData = account.months.find(m => m.month === month);
      return sum + (monthData?.amount || 0);
    }, 0)
  }));

  // Calculate account totals
  const accountTotals = cashflow.data.map(account => ({
    account: account.account,
    total: account.months.reduce((sum, m) => sum + m.amount, 0)
  }));

  // Grand total
  const grandTotal = monthTotals.reduce((sum, m) => sum + m.total, 0);

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
                <th className="text-left py-2 px-2 font-medium min-w-[200px]">Account</th>
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
                  <tr key={idx} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-2 px-2 font-medium whitespace-nowrap">
                      {accountData.account}
                    </td>
                    {accountData.months.map((monthData) => (
                      <td key={monthData.month} className="text-right py-2 px-2">
                        <div className={monthData.amount > 0 ? 'text-gray-900' : 'text-gray-400'}>
                          {formatFullCurrency(monthData.amount)}
                        </div>
                      </td>
                    ))}
                    <td className="text-right py-2 px-2 border-l font-medium">
                      {formatFullCurrency(accountTotal?.total || 0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 font-bold bg-muted/30">
                <td className="py-2 px-2">Total</td>
                {monthTotals.map((monthTotal) => (
                  <td key={monthTotal.month} className="text-right py-2 px-2">
                    {formatFullCurrency(monthTotal.total)}
                  </td>
                ))}
                <td className="text-right py-2 px-2 border-l">
                  {formatFullCurrency(grandTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}