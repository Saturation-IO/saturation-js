'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { XAxis, YAxis, CartesianGrid, Area, AreaChart } from 'recharts';
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { formatCurrency, formatPercent } from '@/lib/format';
import { toSpendSeries } from '@/lib/calc';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { Actual } from '@saturation-api/js';

const chartConfig = {
  actual: {
    label: "Actual",
    color: "var(--primary)",
  },
  budget: {
    label: "Estimate",
    color: "var(--muted-foreground)",
  },
} satisfies ChartConfig;

interface SpendChartProps {
  actuals: Actual[];
  budgetTotal: number;
  maxDataPoints?: number;
}


export function SpendChart({ actuals, budgetTotal, maxDataPoints = 25 }: SpendChartProps) {
  // Transform data for the chart with smoothing
  const chartData = toSpendSeries(actuals, budgetTotal, maxDataPoints);
  
  // Calculate current spend percentage and trends
  const currentSpend = chartData.length > 0 ? chartData[chartData.length - 1].actual : 0;
  const spendPercent = budgetTotal > 0 ? (currentSpend / budgetTotal) * 100 : 0;
  const remaining = budgetTotal - currentSpend;
  
  // Calculate monthly trend (if we have enough data)
  let trendPercent = 0;
  if (chartData.length >= 2) {
    const lastMonth = chartData[chartData.length - 1].actual;
    const prevMonth = chartData[Math.max(0, chartData.length - 8)].actual; // ~1 week ago if daily data
    trendPercent = prevMonth > 0 ? ((lastMonth - prevMonth) / prevMonth) * 100 : 0;
  }

  return (
    <Card className="rounded-2xl shadow-sm border-muted bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-medium text-foreground/90">Spend Over Time</CardTitle>
            <CardDescription>
              Tracking actual spending against {formatCurrency(budgetTotal)} estimate
            </CardDescription>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-muted-foreground">Actual Spend</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
              <span className="text-muted-foreground">Estimate</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[400px] items-center justify-center text-muted-foreground">
            No spending data available
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 10 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                tick={{ fontSize: 10 }}
                width={45}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent 
                    formatter={(value, name) => {
                      const label = name === 'actual' ? 'Actual' : 'Estimate';
                      const colorClass = name === 'actual' ? 'bg-primary' : 'bg-muted-foreground/30';
                      return (
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${colorClass}`} />
                          <span className="font-medium">{label}:</span>
                          <span>{formatCurrency(Number(value))}</span>
                        </div>
                      );
                    }}
                    hideIndicator
                  />
                }
              />
              <defs>
                <linearGradient id="fillActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-actual)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-actual)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillBudget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-budget)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-budget)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <Area
                dataKey="budget"
                type="natural"
                fill="url(#fillBudget)"
                fillOpacity={0.4}
                stroke="var(--color-budget)"
                strokeDasharray="3 3"
                strokeWidth={1.5}
              />
              <Area
                dataKey="actual"
                type="natural"
                fill="url(#fillActual)"
                fillOpacity={0.4}
                stroke="var(--color-actual)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
      {chartData.length > 0 && (
        <CardFooter>
          <div className="flex w-full items-start gap-2 text-sm">
            <div className="grid gap-2">
              <div className="flex items-center gap-2 leading-none font-medium">
                {remaining >= 0 ? (
                  <>
                    {formatCurrency(Math.abs(remaining))} under estimate
                    <TrendingDown className="h-4 w-4 text-green-600" />
                  </>
                ) : (
                  <>
                    {formatCurrency(Math.abs(remaining))} over estimate
                    <TrendingUp className="h-4 w-4 text-red-600" />
                  </>
                )}
              </div>
              <div className="text-muted-foreground flex items-center gap-2 leading-none">
                {formatPercent(spendPercent)} of estimate utilized
                {trendPercent !== 0 && (
                  <span className="text-xs">
                    ({trendPercent > 0 ? '+' : ''}{trendPercent.toFixed(1)}% recent change)
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}