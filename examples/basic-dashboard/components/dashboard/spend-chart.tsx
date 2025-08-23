'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XAxis, YAxis, CartesianGrid, Area, AreaChart, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ChartContainer, ChartConfig } from '@/components/ui/chart';
import { formatCurrency, formatPercent } from '@/lib/format';
import { toSpendSeries } from '@/lib/calc';
import { PrettyTooltip } from './pretty-tooltip';
import type { Actual } from '@saturation-api/js';

const chartConfig = {
  primary: {
    label: "Primary",
    color: "var(--primary)",
  },
  muted: {
    label: "Muted",
    color: "var(--muted)",
  },
} satisfies ChartConfig;

interface SpendChartProps {
  actuals: Actual[];
  budgetTotal: number;
  maxDataPoints?: number;
}

function ChartCard({ title, description, children }: { title: string; description?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card className="rounded-2xl shadow-sm border-muted bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-foreground/90">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="h-[320px] md:h-[360px]">{children}</CardContent>
    </Card>
  );
}

export function SpendChart({ actuals, budgetTotal, maxDataPoints = 25 }: SpendChartProps) {
  // Transform data for the chart with smoothing
  const chartData = toSpendSeries(actuals, budgetTotal, maxDataPoints);
  
  // Calculate current spend percentage
  const currentSpend = chartData.length > 0 ? chartData[chartData.length - 1].actual : 0;
  const spendPercent = budgetTotal > 0 ? (currentSpend / budgetTotal) * 100 : 0;
  const remaining = budgetTotal - currentSpend;

  return (
    <ChartCard
      title="Cumulative Spend Trend"
      description={
        budgetTotal > 0 && (
          <>
            Spent: {formatCurrency(currentSpend)} of {formatCurrency(budgetTotal)} estimate • 
            <span className={spendPercent > 90 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}>
              {' '}{formatPercent(spendPercent)} utilized
            </span> • 
            <span className={remaining >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
              {' '}{formatCurrency(Math.abs(remaining))} {remaining >= 0 ? 'remaining' : 'over estimate'}
            </span>
          </>
        )
      }>

      {chartData.length === 0 ? (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          No spending data available
        </div>
      ) : (
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={chartData}
              margin={{ left: 8, right: 8, top: 10, bottom: 60 }}
            >
              <defs>
                <linearGradient id="spendArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="budgetArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-muted)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-muted)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} className="stroke-border" />
              <XAxis 
                dataKey="date"
                tickLine={false}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={60}
                tickMargin={8}
                tick={{ fontSize: 11 }}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`}
                width={40}
                tick={{ fontSize: 11 }}
              />
              <Tooltip content={<PrettyTooltip currencyFormat={true} />} />
              <Legend verticalAlign="top" height={24} />
              <Area
                type="monotone"
                dataKey="budget"
                name="Estimate"
                stroke="var(--color-muted)"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="url(#budgetArea)"
                strokeOpacity={0.7}
              />
              <Area
                type="monotone"
                dataKey="actual"
                name="Actual Spend"
                stroke="var(--color-primary)"
                strokeWidth={2.5}
                fill="url(#spendArea)"
                dot={{ r: 2, fill: "var(--color-primary)" }}
                activeDot={{ r: 5, fill: "var(--color-primary)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}
    </ChartCard>
  );
}