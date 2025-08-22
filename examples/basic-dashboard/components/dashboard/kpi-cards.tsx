'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatPercent } from '@/lib/format';
import { calcKpis } from '@/lib/calc';
import type { Budget, Actual, PurchaseOrder } from '@saturation-api/js';

interface KpiCardsProps {
  budget: Budget | null;
  actuals: Actual[];
  purchaseOrders: PurchaseOrder[];
}

export function KpiCards({ budget, actuals, purchaseOrders }: KpiCardsProps) {
  // Calculate all KPIs using the utility function
  const kpis = calcKpis(budget, actuals, purchaseOrders);

  const cards = [
    {
      title: 'Total Budget',
      value: formatCurrency(kpis.totalBudget),
      description: 'Working phase budget',
      color: 'text-blue-600',
    },
    {
      title: 'Actual Spend',
      value: formatCurrency(kpis.totalActuals),
      description: `${formatPercent(kpis.burnPercent)} of budget`,
      color: 'text-green-600',
    },
    {
      title: 'Open Commitments',
      value: formatCurrency(kpis.openCommitments),
      description: 'Pending & approved POs',
      color: 'text-orange-600',
    },
    {
      title: 'Remaining',
      value: formatCurrency(kpis.remaining),
      description: kpis.remaining < 0 ? 'Over budget' : 'Available to spend',
      color: kpis.remaining < 0 ? 'text-red-600' : 'text-gray-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.color}`}>
              {card.value}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}