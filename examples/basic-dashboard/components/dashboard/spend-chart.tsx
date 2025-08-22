'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Area, AreaChart } from 'recharts';
import { formatCurrency, formatPercent } from '@/lib/format';
import { toSpendSeries } from '@/lib/calc';
import type { Actual } from '@saturation-api/js';

interface SpendChartProps {
  actuals: Actual[];
  budgetTotal: number;
}

const chartConfig = {
  actual: {
    label: "Actual Spend",
    color: "hsl(var(--chart-2))",
  },
  budget: {
    label: "Budget Limit",
    color: "hsl(var(--chart-1))",
  },
}

export function SpendChart({ actuals, budgetTotal }: SpendChartProps) {
  // Transform data for the chart
  const chartData = toSpendSeries(actuals, budgetTotal);
  
  // Calculate current spend percentage
  const currentSpend = chartData.length > 0 ? chartData[chartData.length - 1].actual : 0;
  const spendPercent = budgetTotal > 0 ? (currentSpend / budgetTotal) * 100 : 0;
  const remaining = budgetTotal - currentSpend;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cumulative Spend Trend</CardTitle>
        <CardDescription>
          {budgetTotal > 0 && (
            <>
              Spent: {formatCurrency(currentSpend)} of {formatCurrency(budgetTotal)} • 
              <span className={spendPercent > 90 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}>
                {' '}{formatPercent(spendPercent)} utilized
              </span> • 
              <span className={remaining >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                {' '}{formatCurrency(Math.abs(remaining))} {remaining >= 0 ? 'remaining' : 'over budget'}
              </span>
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[350px] items-center justify-center text-muted-foreground">
            No spending data available
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <AreaChart 
              data={chartData}
              margin={{ top: 20, right: 20, bottom: 80, left: 60 }}
            >
              <defs>
                <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="budgetGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
              />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value)}
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
              />
              <ChartTooltip 
                content={
                  <ChartTooltipContent 
                    formatter={(value) => formatCurrency(value as number)}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="budget"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="url(#budgetGradient)"
                strokeOpacity={0.5}
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="hsl(var(--chart-2))"
                strokeWidth={3}
                fill="url(#spendGradient)"
                dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}