'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { formatCurrency } from '@/lib/format';
import { toTopVendors } from '@/lib/calc';
import type { Actual, PurchaseOrder } from '@saturation-api/js';

interface VendorsChartProps {
  actuals: Actual[];
  purchaseOrders: PurchaseOrder[];
}

const chartConfig = {
  total: {
    label: "Total Spend",
    color: "oklch(0.606 0.25 292.717)",
  },
}

export function VendorsChart({ actuals, purchaseOrders }: VendorsChartProps) {
  // Get top 10 vendors
  const topVendors = toTopVendors(actuals, purchaseOrders, 10);
  
  // Calculate total spent with top vendors
  const totalSpend = topVendors.reduce((sum, vendor) => sum + vendor.total, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Vendors</CardTitle>
        <CardDescription>
          {topVendors.length > 0 && (
            <>Top {topVendors.length} vendors • Total: {formatCurrency(totalSpend)}</>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {topVendors.length === 0 ? (
          <div className="flex h-[350px] items-center justify-center text-muted-foreground">
            No vendor data available
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <BarChart 
              data={topVendors}
              layout="horizontal"
              margin={{ top: 20, right: 20, bottom: 20, left: 120 }}
            >
              <defs>
                <linearGradient id="vendorGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="oklch(0.606 0.25 292.717)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="oklch(0.606 0.25 292.717)" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                type="number"
                tickFormatter={(value) => formatCurrency(value)}
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
              />
              <YAxis 
                type="category"
                dataKey="name"
                width={110}
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
                dataKey="total" 
                fill="url(#vendorGradient)"
                radius={[0, 8, 8, 0]}
                animationDuration={500}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}