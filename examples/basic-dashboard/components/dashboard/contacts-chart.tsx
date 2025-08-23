'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { formatCurrency } from '@/lib/format';
import { toTopContacts } from '@/lib/calc';
import type { Actual } from '@saturation-api/js';

interface ContactsChartProps {
  actuals: Actual[];
}

const chartConfig = {
  amount: {
    label: "Amount Paid",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig;

export function ContactsChart({ actuals }: ContactsChartProps) {
  // Get top 10 contacts based on actuals only
  const topContacts = toTopContacts(actuals, 10);
  
  // Calculate total spent with top contacts
  const totalSpend = topContacts.reduce((sum, contact) => sum + contact.amount, 0);

  return (
    <Card className="rounded-2xl shadow-sm border-muted bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-foreground/90">Top Contacts</CardTitle>
        <CardDescription>
          {topContacts.length > 0 ? `Top ${topContacts.length} contacts • Total: ${formatCurrency(totalSpend)}` : 'Based on actual payments'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {topContacts.length === 0 ? (
          <div className="flex h-[400px] items-center justify-center text-muted-foreground">
            No contact payment data available
          </div>
        ) : (
          <div className="overflow-y-auto overflow-x-hidden" style={{ maxHeight: '400px' }}>
            <ChartContainer 
              config={chartConfig}
              style={{ 
                height: `${Math.max(topContacts.length * 50, 320)}px`,
                minHeight: '320px',
                width: '100%'
              }}
            >
              <BarChart
                accessibilityLayer
                data={topContacts}
                layout="vertical"
                margin={{
                  left: 0,
                  right: 50,
                  top: 10,
                  bottom: 10,
                }}
                height={Math.max(topContacts.length * 50, 320)}
                barCategoryGap="20%"
              >
                <CartesianGrid horizontal={false} />
                <YAxis
                  dataKey="contact"
                  type="category"
                  tickLine={false}
                  tickMargin={0}
                  axisLine={false}
                  width={150}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.length > 20 ? value.substring(0, 20) + '...' : value}
                />
                <XAxis 
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 10 }}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent 
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(value: any) => formatCurrency(Number(value))}
                    />
                  }
                />
                <Bar 
                  dataKey="amount" 
                  fill="var(--color-primary)"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}