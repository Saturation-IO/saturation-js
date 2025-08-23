'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency, formatPercent } from '@/lib/format';
import { toPoStatusData } from '@/lib/calc';
import { PrettyTooltip } from './pretty-tooltip';
import type { PurchaseOrder } from '@saturation-api/js';

interface PoChartProps {
  purchaseOrders: PurchaseOrder[];
}

// Define status colors using CSS variables
const poStatusColors = {
  Draft: '#94a3b8',  // Slate color for draft
  Pending: '#fbbf24', // Amber for pending
  Approved: '#34d399', // Emerald for approved  
  Paid: '#a78bfa', // Violet for paid (matches primary theme)
  Cancelled: '#f87171', // Red for cancelled
};

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

export function PoChart({ purchaseOrders }: PoChartProps) {
  // Transform data for the chart
  const chartData = toPoStatusData(purchaseOrders);
  
  // Calculate total
  const total = purchaseOrders.reduce((sum, po) => sum + (po.amount || 0), 0);
  const count = purchaseOrders.length;
  
  // Add percentages and colors to data
  const dataWithDetails = chartData.map((item, index) => ({
    ...item,
    percentage: total > 0 ? (item.value / total) * 100 : 0,
    fill: poStatusColors[item.name as keyof typeof poStatusColors] || '#94a3b8'
  }));
  
  // Custom label renderer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderLabel = (props: any) => {
    const entry = dataWithDetails.find(d => d.name === props.name);
    if (!entry) return '';
    return entry.percentage > 5 ? `${entry.percentage.toFixed(0)}%` : '';
  };

  return (
    <ChartCard
      title="Purchase Orders by Status"
      description={
        <>Total POs: {count} • Total Value: {formatCurrency(total)}</>
      }>

      {chartData.length === 0 ? (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          No purchase orders found
        </div>
      ) : (
        <div className="h-full flex flex-col">
          <ResponsiveContainer width="100%" height="75%">
            <PieChart>
              <Tooltip content={<PrettyTooltip currencyFormat={true} />} />
              <Pie
                data={dataWithDetails}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderLabel}
                innerRadius={52}
                outerRadius={90}
                paddingAngle={6}
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {dataWithDetails.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.fill}
                  />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" height={28} />
            </PieChart>
          </ResponsiveContainer>
            
          {/* Custom Legend */}
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            {dataWithDetails.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div 
                  className="h-2.5 w-2.5 rounded-sm" 
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-xs text-muted-foreground">
                  {item.name}: {formatCurrency(item.value)} ({formatPercent(item.percentage)})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </ChartCard>
  );
}