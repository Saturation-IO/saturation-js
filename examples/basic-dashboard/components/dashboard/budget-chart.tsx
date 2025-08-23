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
import { usePhase } from '@/contexts/PhaseContext';
import type { Budget } from '@saturation-api/js';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface BudgetChartProps {
  budget: Budget | null;
}

const chartConfig = {
  estimate: {
    label: "Phase",
    color: "var(--muted-foreground)",
  },
  actual: {
    label: "Actual", 
    color: "var(--primary)",
  },
} satisfies ChartConfig;

// Custom Y-axis tick component with better line spacing
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomYAxisTick = (props: any) => {
  const { x, y, payload } = props;
  
  // Ensure payload.value is a string
  const text = String(payload?.value || '');
  const words = text.split(' ');
  const lineHeight = 14;
  
  // Split into lines if too long
  const lines: string[] = [];
  let currentLine = '';
  
  words.forEach((word: string) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length > 20 && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  if (currentLine) lines.push(currentLine);
  
  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  
  return (
    <g>
      {lines.map((line, index) => (
        <text
          key={index}
          x={x - 8}
          y={startY + index * lineHeight}
          fill="var(--foreground)"
          fontSize={10}
          textAnchor="end"
          dominantBaseline="middle"
        >
          {line}
        </text>
      ))}
    </g>
  );
};

export function BudgetChart({ budget }: BudgetChartProps) {
  const { selectedPhase } = usePhase();
  
  // Return early if no budget
  if (!budget) {
    return (
      <Card className="rounded-2xl shadow-sm border-muted bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-foreground/90">Actuals vs {selectedPhase.name}</CardTitle>
          <CardDescription>No budget data available</CardDescription>
        </CardHeader>
        <CardContent className="h-[320px] md:h-[360px] flex items-center justify-center text-muted-foreground">
          No budget data available
        </CardContent>
      </Card>
    );
  }

  // Transform data for the chart with selected phase
  const rawData = toBudgetVsActuals(budget, selectedPhase.alias);

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
  
  // Sort by actual spending (highest to lowest)
  const sortedData = filteredData.sort((a, b) => b.actual - a.actual);
  
  // Prepare data with background (actual) and foreground (estimate) for each account
  // Remove the slice limit to show all accounts
  const chartData = sortedData.map(item => ({
    account: item.account,
    // Actual bar is always the background - ensure minimum width
    background: Math.max(item.actual, 5000), // increased minimum for better visibility
    // Estimate bar is always the foreground (gray) on top
    foreground: item.estimate,
    actual: item.actual,
    estimate: item.estimate,
    isOverBudget: item.actual > item.estimate, // Track if over budget
    displayValue: `${formatCurrency(item.actual)} / ${formatCurrency(item.estimate)}`,
  }));

  if (chartData.length === 0) {
    return (
      <Card className="rounded-2xl shadow-sm border-muted bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-foreground/90">Actuals vs {selectedPhase.name}</CardTitle>
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
        <CardTitle className="text-base font-medium text-foreground/90">Actuals vs {selectedPhase?.name || 'Estimate'}</CardTitle>
        <CardDescription>Comparing budgeted amounts to actual spending by account</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-y-auto overflow-x-hidden" style={{ maxHeight: '400px' }}>
          <ChartContainer 
            config={chartConfig}
            style={{ 
              height: `${Math.max(chartData.length * 50, 320)}px`,
              minHeight: '320px',
              width: '100%'
            }}
          >
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={{
                left: 0,
                right: 160,
                top: 10,
                bottom: 10,
              }}
              height={Math.max(chartData.length * 50, 320)}
              barCategoryGap="20%"
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="account"
                type="category"
                tickLine={false}
                tickMargin={8}
                axisLine={false}
                width={140}
                tick={CustomYAxisTick}
              />
              <XAxis type="number" hide />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent 
                    hideLabel
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any, name: any, item: any) => {
                      const data = item.payload;
                      // Only show the tooltip for the first bar to avoid duplication
                      if (name === 'foreground') return null;
                      
                      return (
                        <div className="flex flex-col gap-1.5">
                          <div className="font-medium text-sm">{data.account}</div>
                          <div className="flex items-center gap-2">
                            <div 
                              className="h-2 w-2 rounded-sm" 
                              style={{ backgroundColor: data.isOverBudget ? "hsl(346, 77%, 50%)" : "var(--primary)" }}
                            />
                            <span className="flex justify-between gap-4 flex-1">
                              <span>Actual:</span>
                              <span className="font-mono font-medium">{formatCurrency(data.actual)}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-sm bg-muted-foreground opacity-60" />
                            <span className="flex justify-between gap-4 flex-1">
                              <span>Phase:</span>
                              <span className="font-mono font-medium">{formatCurrency(data.estimate)}</span>
                            </span>
                          </div>
                        </div>
                      );
                    }}
                  />
                }
              />
              {/* Background bar - Always actual (purple or rose if over budget) */}
              <Bar
                dataKey="background"
                radius={4}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`bg-${index}`}
                    fill={entry.isOverBudget ? "hsl(346, 77%, 50%)" : "var(--color-actual)"}
                  />
                ))}
              </Bar>
              {/* Foreground bar - Always estimate (gray) */}
              <Bar
                dataKey="foreground"
                radius={4}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`fg-${index}`}
                    fill="var(--color-estimate)"
                    fillOpacity={0.6}
                  />
                ))}
                <LabelList
                  dataKey="displayValue"
                  position="right"
                  offset={8}
                  fontSize={10}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  content={(props: any) => {
                    const { x, y, width, height, value } = props;
                    return (
                      <text
                        x={x + width + 8}
                        y={y + height / 2}
                        fill="var(--foreground)"
                        fontSize={10}
                        dominantBaseline="middle"
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        {value}
                      </text>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-sm bg-primary" />
            Actual
          </span>
          <span className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-sm bg-muted-foreground opacity-30" />
            {selectedPhase.name}
          </span>
        </div>
        <div className="flex gap-2 leading-none font-medium">
          {variance >= 0 ? (
            <>
              Under {selectedPhase.name.toLowerCase()} by {formatCurrency(Math.abs(variance))} ({Math.abs(variancePercent).toFixed(1)}%)
              <TrendingDown className="h-4 w-4 text-green-600" />
            </>
          ) : (
            <>
              Over {selectedPhase.name.toLowerCase()} by {formatCurrency(Math.abs(variance))} ({Math.abs(variancePercent).toFixed(1)}%)
              <TrendingUp className="h-4 w-4 text-red-600" />
            </>
          )}
        </div>
        <div className="text-muted-foreground leading-none text-xs">
          Total {selectedPhase.name}: {formatCurrency(totalEstimate)} • Total Actual: {formatCurrency(totalActual)}
        </div>
      </CardFooter>
    </Card>
  );
}