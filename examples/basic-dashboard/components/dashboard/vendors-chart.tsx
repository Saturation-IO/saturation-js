'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/format';
import { toTopVendors } from '@/lib/calc';
import { PrettyTooltip } from './pretty-tooltip';
import type { Actual, PurchaseOrder } from '@saturation-api/js';

interface VendorsChartProps {
  actuals: Actual[];
  purchaseOrders: PurchaseOrder[];
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

export function VendorsChart({ actuals, purchaseOrders }: VendorsChartProps) {
  // Get top 10 vendors
  const topVendors = toTopVendors(actuals, purchaseOrders, 10);
  
  // Calculate total spent with top vendors
  const totalSpend = topVendors.reduce((sum, vendor) => sum + vendor.total, 0);

  return (
    <ChartCard
      title="Top Vendors"
      description={
        topVendors.length > 0 && (
          <>Top {topVendors.length} vendors • Total: {formatCurrency(totalSpend)}</>
        )
      }>

      {topVendors.length === 0 ? (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          No vendor data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={topVendors}
            layout="horizontal"
            margin={{ top: 10, right: 8, bottom: 10, left: 100 }}
          >
            <defs>
              <linearGradient id="vendorBar" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.9} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} className="stroke-border" />
            <XAxis 
              type="number"
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`}
              tick={{ fontSize: 11 }}
            />
            <YAxis 
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              width={90}
              tick={{ fontSize: 11 }}
            />
            <Tooltip content={<PrettyTooltip currencyFormat={true} />} />
            <Bar 
              dataKey="total" 
              name="Total Spend"
              fill="url(#vendorBar)"
              radius={[0, 6, 6, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}