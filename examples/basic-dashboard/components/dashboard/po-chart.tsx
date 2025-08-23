'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Label } from 'recharts';
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { formatCurrency, formatPercent } from '@/lib/format';
import { toPoStatusData } from '@/lib/calc';
import { TrendingUp } from 'lucide-react';
import type { PurchaseOrder } from '@saturation-api/js';

interface PoChartProps {
  purchaseOrders: PurchaseOrder[];
}

// Define chart config with colors
const chartConfig = {
  Paid: {
    label: "Paid",
    color: "var(--color-violet-500)",
  },
  Approved: {
    label: "Approved",
    color: "var(--color-blue-500)",
  },
  Waiting: {
    label: "Waiting",
    color: "var(--color-amber-500)",
  },
  Draft: {
    label: "Draft",
    color: "var(--color-gray-500)",
  },

} satisfies ChartConfig;

export function PoChart({ purchaseOrders }: PoChartProps) {
  // Transform data for the chart
  const chartData = toPoStatusData(purchaseOrders);
  
  // Calculate totals
  const total = purchaseOrders.reduce((sum, po) => sum + (po.amount || 0), 0);
  const paidAmount = purchaseOrders
    .filter(po => po.status === 'paid')
    .reduce((sum, po) => sum + (po.amount || 0), 0);
  const count = purchaseOrders.length;
  
  // Transform data with proper labels and colors
  const dataWithFill = chartData.map((item) => {
    // Map to color based on status name
    return {
      ...item,
      fill: `var(--color-${item.name})`,
    };
  });

  return (
    <Card className="rounded-2xl shadow-sm border-muted bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-foreground/90">Purchase Orders</CardTitle>
        <CardDescription>
          Total POs: {count} • Total Value: {formatCurrency(total)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[400px] items-center justify-center text-muted-foreground">
            No purchase orders found
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent 
                    formatter={(value, name) => {
                      // Find the color for this status
                      const statusConfig = chartConfig[name as keyof typeof chartConfig];
                      const color = statusConfig?.color || 'var(--color-muted)';
                      
                      return (
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2.5 h-2.5 rounded-full" 
                            style={{ backgroundColor: color }}
                          />
                          <span className="font-medium">{name}:</span>
                          <span>{formatCurrency(Number(value))}</span>
                        </div>
                      );
                    }}
                  />
                }
              />
              <Pie
                data={dataWithFill}
                dataKey="value"
                nameKey="name"
                innerRadius={100}
                outerRadius={140}
                strokeWidth={2}
                paddingAngle={2}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-2xl font-bold"
                          >
                            {formatCurrency(paidAmount)}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground text-sm"
                          >
                            Paid
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex w-full flex-wrap gap-3 text-sm">
          {/* Show all possible statuses */}
          {Object.entries(chartConfig).map(([key, status]) => {
            // Find the actual data for this status
            const dataItem = dataWithFill.find(d => d.name === status.label);
            const value = dataItem?.value || 0;
            const percentage = total > 0 && dataItem ? (dataItem.value / total) * 100 : 0;
            
            return (
              <div key={key} className="flex items-center gap-1.5">
                <div 
                  className="h-2.5 w-2.5 rounded-full" 
                  style={{ backgroundColor: status.color }}
                />
                <span className="text-muted-foreground">
                  {status.label}: {value > 0 ? `${formatCurrency(value)} (${formatPercent(percentage)})` : '—'}
                </span>
              </div>
            );
          })}
        </div>
      </CardFooter>
    </Card>
  );
}