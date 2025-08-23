import React from "react";
import { formatCurrency } from "@/lib/format";

interface TooltipPayload {
  color: string;
  name?: string;
  dataKey?: string;
  value: number;
}

interface PrettyTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
  valueFmt?: (value: number) => string;
  currencyFormat?: boolean;
}

export function PrettyTooltip({ 
  active, 
  payload, 
  label, 
  valueFmt,
  currencyFormat = true 
}: PrettyTooltipProps) {
  if (!active || !payload?.length) return null;
  
  const formatter = valueFmt || (currencyFormat ? formatCurrency : (v: number) => v.toLocaleString());
  
  return (
    <div className="rounded-xl border bg-popover px-3 py-2 text-sm shadow-md backdrop-blur-sm">
      <div className="mb-1 font-medium text-foreground/90">{label}</div>
      <div className="space-y-1">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <span 
              className="inline-block h-2.5 w-2.5 rounded-sm" 
              style={{ background: p.color }} 
            />
            <span className="text-muted-foreground">{p.name || p.dataKey}</span>
            <span className="ml-auto font-medium tabular-nums">
              {formatter(p.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}