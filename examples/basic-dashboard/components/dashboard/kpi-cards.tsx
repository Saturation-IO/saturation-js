'use client';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
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
      title: 'Total Estimate',
      value: formatCurrency(kpis.totalBudget),
      description: 'Estimate phase',
      icon: null,
      iconColor: '',
    },
    {
      title: 'Actual Spend',
      value: formatCurrency(kpis.totalActuals),
      description: `${formatPercent(kpis.burnPercent)} utilized`,
      icon: kpis.burnPercent > 80 ? AlertTriangle : TrendingUp,
      iconColor: kpis.burnPercent > 80 ? 'text-amber-500' : 'text-emerald-500',
    },
    {
      title: 'Open Commitments',
      value: formatCurrency(kpis.openCommitments),
      description: 'Pending & approved',
      icon: null,
      iconColor: '',
    },
    {
      title: 'Remaining Budget',
      value: formatCurrency(Math.abs(kpis.remaining)),
      description: kpis.remaining < 0 ? 'Over estimate' : 'Available',
      icon: kpis.remaining < 0 ? TrendingDown : TrendingUp,
      iconColor: kpis.remaining < 0 ? 'text-red-500' : 'text-emerald-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="@container/card">
            <CardHeader>
              <CardDescription>{card.title}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {card.value}
              </CardTitle>
              {card.description && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
                  {card.description}
                  {Icon && <Icon className={`h-3 w-3 ${card.iconColor}`} />}
                </div>
              )}
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
}