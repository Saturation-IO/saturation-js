'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Check, CheckSquare, Eraser } from 'lucide-react';

export const COLUMN_KEYS = [
  'id',
  'description',
  'tags',
  'contact',
  'fringes',
  'dates',
  'quantity',
  'rate',
  'x',
] as const;

export type ColumnKey = (typeof COLUMN_KEYS)[number];

type Props = {
  value?: ColumnKey[];
  onChange?: (cols: ColumnKey[]) => void;
  hideInlineActions?: boolean;
};

export function ColumnsMultiSelect({ value, onChange, hideInlineActions }: Props) {
  const selectedSet = useMemo(
    () => new Set<ColumnKey>((value as ColumnKey[] | undefined) ?? ['id', 'description']),
    [value]
  );
  const selected = useMemo(() => Array.from(selectedSet), [selectedSet]);

  const toggle = (key: ColumnKey) => {
    const next = new Set<ColumnKey>(selectedSet);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange?.(Array.from(next));
  };

  const selectAll = () => {
    onChange?.(Array.from(COLUMN_KEYS));
  };

  const clearAll = () => {
    onChange?.([]);
  };

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="columns" className="text-sm">
          Columns
        </Label>
        <p className="text-xs text-muted-foreground mt-1">
          Choose which fields appear as CSV columns.
        </p>
      </div>
      <div id="columns" className="flex flex-wrap gap-2">
        {COLUMN_KEYS.map((col) => {
          const isActive = selectedSet.has(col);
          return (
            <Button
              key={col}
              type="button"
              variant={isActive ? 'secondary' : 'outline'}
              size="sm"
              className="capitalize"
              aria-pressed={isActive}
              onClick={() => toggle(col)}
            >
              {isActive && <Check className="mr-1.5" />}
              {col}
            </Button>
          );
        })}
        {!hideInlineActions && (
          <div className="flex items-center gap-2 text-xs pl-1" role="group" aria-label="Column bulk actions">
            <span className="text-muted-foreground">•</span>
            <Button variant="link" size="sm" type="button" className="h-6 px-1" onClick={selectAll}>
              <CheckSquare className="mr-1.5 size-3" />
              Select all
            </Button>
            <span className="text-muted-foreground">•</span>
            <Button variant="link" size="sm" type="button" className="h-6 px-1" onClick={clearAll}>
              <Eraser className="mr-1.5 size-3" />
              Clear
            </Button>
          </div>
        )}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{selected.length} selected</div>
    </div>
  );
}
