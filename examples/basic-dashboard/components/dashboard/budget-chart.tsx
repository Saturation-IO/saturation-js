'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis, Cell } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { formatCurrency } from '@/lib/format';
import { toBudgetVsActuals } from '@/lib/calc';
import type { Budget } from '@saturation-api/js';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface BudgetChartProps {
  budget: Budget | null;
}

const chartConfig = {
  estimate: {
    label: "Estimate",
    color: "var(--muted)",
  },
  actual: {
    label: "Actual", 
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function BudgetChart({ budget }: BudgetChartProps) {
  // Return early if no budget
  if (!budget) {
    return (
      <Card className="rounded-2xl shadow-sm border-muted bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-foreground/90">Estimate vs Actuals</CardTitle>
          <CardDescription>No budget data available</CardDescription>
        </CardHeader>
        <CardContent className="h-[320px] md:h-[360px] flex items-center justify-center text-muted-foreground">
          No budget data available
        </CardContent>
      </Card>
    );
  }

  // Transform data for the chart
  const rawData = toBudgetVsActuals(budget);

  // Calculate totals for the footer
  const totalEstimate = rawData.reduce((sum, item) => sum + item.estimate, 0);
  const totalActual = rawData.reduce((sum, item) => sum + item.actual, 0);
  const variance = totalEstimate - totalActual;
  const variancePercent = totalEstimate > 0 ? (variance / totalEstimate) * 100 : 0;

  // Filter out Uncategorized and take top accounts
  const filteredData = rawData.filter(item => 
    item.account !== 'Uncategorized' && 
    item.account !== 'Other' &&
    item.account !== ''
  );
  
  // Prepare data with background (larger value) and foreground (smaller value) for each account
  const chartData = filteredData.slice(0, 8).map(item => ({
    account: item.account.length > 25 ? item.account.substring(0, 25) + '...' : item.account,
    // Background bar is the larger value - ensure minimum width for text
    background: Math.max(item.actual, item.estimate, 1000),
    // Foreground bar is the smaller value
    foreground: Math.min(item.actual, item.estimate),
    // Track which is which for coloring and labels
    isActualLarger: item.actual > item.estimate,
    actual: item.actual,
    estimate: item.estimate,
    displayValue: `${formatCurrency(item.actual)} / ${formatCurrency(item.estimate)}`,
  }));

  if (chartData.length === 0) {
    return (
      <Card className="rounded-2xl shadow-sm border-muted bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-foreground/90">Estimate vs Actuals</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent className="h-[320px] md:h-[360px] flex items-center justify-center text-muted-foreground">
          No estimate or actual data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-sm border-muted bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-foreground/90">Estimate vs Actuals</CardTitle>
        <CardDescription>By Account</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: 16,
              right: 140,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="account"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              hide
            />
            <XAxis type="number" hide />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent 
                  formatter={(value, name, item) => {
                    const data = item.payload;
                    return (
                      <div className="flex flex-col gap-1">
                        <span className="flex justify-between gap-4">
                          <span>Actual:</span>
                          <span className="font-mono font-medium">{formatCurrency(data.actual)}</span>
                        </span>
                        <span className="flex justify-between gap-4">
                          <span>Estimate:</span>
                          <span className="font-mono font-medium">{formatCurrency(data.estimate)}</span>
                        </span>
                      </div>
                    );
                  }}
                />
              }
            />
            {/* Background bar (larger value) */}
            <Bar
              dataKey="background"
              radius={4}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`bg-${index}`}
                  fill={entry.isActualLarger ? "var(--color-actual)" : "var(--color-estimate)"}
                  fillOpacity={0.2}
                />
              ))}
              <LabelList
                dataKey="account"
                position="insideLeft"
                offset={8}
                className="fill-foreground whitespace-nowrap"
                fontSize={11}
                fontWeight={500}
              />
            </Bar>
            {/* Foreground bar (smaller value) */}
            <Bar
              dataKey="foreground"
              radius={4}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`fg-${index}`}
                  fill={entry.isActualLarger ? "var(--color-estimate)" : "var(--color-actual)"}
                />
              ))}
              <LabelList
                dataKey="displayValue"
                position="right"
                offset={8}
                className="fill-foreground whitespace-nowrap"
                fontSize={10}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-sm bg-primary" />
            Actual
          </span>
          <span className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-sm bg-muted" />
            Estimate
          </span>
        </div>
        <div className="flex gap-2 leading-none font-medium">
          {variance >= 0 ? (
            <>
              Under estimate by {formatCurrency(Math.abs(variance))} ({Math.abs(variancePercent).toFixed(1)}%)
              <TrendingDown className="h-4 w-4 text-green-600" />
            </>
          ) : (
            <>
              Over estimate by {formatCurrency(Math.abs(variance))} ({Math.abs(variancePercent).toFixed(1)}%)
              <TrendingUp className="h-4 w-4 text-red-600" />
            </>
          )}
        </div>
        <div className="text-muted-foreground leading-none text-xs">
          Total Estimate: {formatCurrency(totalEstimate)} • Total Actual: {formatCurrency(totalActual)}
        </div>
      </CardFooter>
    </Card>
  );
}