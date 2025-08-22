'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency, formatPercent } from '@/lib/format';
import { toPoStatusData } from '@/lib/calc';
import type { PurchaseOrder } from '@saturation-api/js';

interface PoChartProps {
  purchaseOrders: PurchaseOrder[];
}

const chartConfig = {
  Draft: {
    label: "Draft",
    color: "oklch(0.828 0.189 84.429)",
  },
  Pending: {
    label: "Pending",
    color: "oklch(0.769 0.188 70.08)",
  },
  Approved: {
    label: "Approved",
    color: "oklch(0.6 0.118 184.704)",
  },
  Rejected: {
    label: "Rejected",
    color: "oklch(0.577 0.245 27.325)",
  },
  Cancelled: {
    label: "Cancelled",
    color: "oklch(0.552 0.016 285.938)",
  },
  Closed: {
    label: "Closed",
    color: "oklch(0.606 0.25 292.717)",
  },
}

export function PoChart({ purchaseOrders }: PoChartProps) {
  // Transform data for the chart
  const chartData = toPoStatusData(purchaseOrders);
  
  // Calculate total
  const total = purchaseOrders.reduce((sum, po) => sum + (po.total || 0), 0);
  const count = purchaseOrders.length;
  
  // Add percentages and colors to data
  const dataWithDetails = chartData.map(item => ({
    ...item,
    percentage: total > 0 ? (item.value / total) * 100 : 0,
    fill: chartConfig[item.name as keyof typeof chartConfig]?.color || "oklch(0.552 0.016 285.938)"
  }));
  
  // Custom label renderer
  const renderLabel = (entry: any) => {
    return entry.percentage > 5 ? `${entry.percentage.toFixed(0)}%` : '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase Orders by Status</CardTitle>
        <CardDescription>
          Total POs: {count} • Total Value: {formatCurrency(total)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[350px] items-center justify-center text-muted-foreground">
            No purchase orders found
          </div>
        ) : (
          <div className="space-y-4">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <PieChart>
                <defs>
                  {Object.entries(chartConfig).map(([key, config]) => (
                    <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={config.color} stopOpacity={0.8} />
                      <stop offset="100%" stopColor={config.color} stopOpacity={0.3} />
                    </linearGradient>
                  ))}
                </defs>
                <ChartTooltip 
                  content={
                    <ChartTooltipContent 
                      formatter={(value) => formatCurrency(value as number)}
                    />
                  }
                />
                <Pie
                  data={dataWithDetails}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {dataWithDetails.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#gradient-${entry.name})`}
                      stroke={entry.fill}
                      strokeWidth={1}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            
            {/* Custom Legend */}
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              {dataWithDetails.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="h-3 w-3 rounded-full border" 
                    style={{ 
                      backgroundColor: item.fill,
                      borderColor: item.fill 
                    }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {item.name}: {formatCurrency(item.value)} ({formatPercent(item.percentage)})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}