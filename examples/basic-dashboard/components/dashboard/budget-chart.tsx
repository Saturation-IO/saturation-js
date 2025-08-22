'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/format';
import { toBudgetVsActuals } from '@/lib/calc';
import type { Budget, Actual } from '@saturation-api/js';

interface BudgetChartProps {
  budget: Budget | null;
  actuals: Actual[];
}

const chartConfig = {
  budget: {
    label: "Budget",
    color: "hsl(var(--chart-1))",
  },
  actual: {
    label: "Actual",
    color: "hsl(var(--chart-2))",
  },
}

export function BudgetChart({ budget, actuals }: BudgetChartProps) {
  // Transform data for the chart
  const chartData = toBudgetVsActuals(budget, actuals);

  // Calculate totals for the description
  const totalBudget = chartData.reduce((sum, item) => sum + item.budget, 0);
  const totalActual = chartData.reduce((sum, item) => sum + item.actual, 0);
  const variance = totalBudget - totalActual;
  const variancePercent = totalBudget > 0 ? (variance / totalBudget) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget vs Actuals</CardTitle>
        <CardDescription>
          {totalBudget > 0 && (
            <>
              Total Budget: {formatCurrency(totalBudget)} • 
              Total Actual: {formatCurrency(totalActual)} • 
              <span className={variance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                {' '}Variance: {formatCurrency(Math.abs(variance))} ({variancePercent.toFixed(1)}%)
              </span>
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[350px] items-center justify-center text-muted-foreground">
            No budget or actual data available
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <BarChart 
              data={chartData}
              margin={{ top: 20, right: 20, bottom: 80, left: 60 }}
            >
              <defs>
                <linearGradient id="budgetGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                </linearGradient>
                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="account" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
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
              <Bar 
                dataKey="budget" 
                fill="url(#budgetGradient)"
                radius={[8, 8, 0, 0]}
                animationDuration={500}
              />
              <Bar 
                dataKey="actual" 
                fill="url(#actualGradient)"
                radius={[8, 8, 0, 0]}
                animationDuration={700}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}