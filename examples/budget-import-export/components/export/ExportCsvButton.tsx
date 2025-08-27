'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { useSaturation } from '@/contexts/SaturationContext';
import { fetchBudget, budgetToCsv, type BudgetColumn } from '@/lib/budgetCsv';

type Props = {
  projectId?: string;
  projectName?: string;
  columns?: string[];
  phases?: string[];
};

export function ExportCsvButton({ projectId, projectName, columns, phases }: Props) {
  const saturation = useSaturation();
  const [loading, setLoading] = useState(false);
  // no-op

  const handleClick = async () => {
    if (!projectId) {
      toast.error('Select a project first');
      return;
    }
    try {
      setLoading(true);
      toast('Export started', { description: 'Loading budget…' });
      const budget = await fetchBudget(saturation, projectId);
      const csv = budgetToCsv(budget, {
        includeHeaders: true,
        columns: (columns as BudgetColumn[] | undefined),
        phases: phases || undefined,
      });
      const lines = csv.split('\n').filter(Boolean);
      const count = Math.max(0, lines.length - 1); // exclude header

      // Trigger file download
      const name = (projectName?.trim()?.replace(/\s+/g, '_') || 'project') + '_budget.csv';
      const safeName = name.replace(/[^a-zA-Z0-9._-]/g, '_');
      // Add BOM for better CSV handling in Excel
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = safeName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('CSV downloaded', {
        description: `${count} rows exported to ${safeName}`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load budget';
      toast.error('Export failed', { description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleClick} disabled={!projectId || loading}>
      {loading ? 'Loading…' : 'Export CSV'}
    </Button>
  );
}
