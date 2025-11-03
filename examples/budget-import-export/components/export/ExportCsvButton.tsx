'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { useSaturation } from '@/contexts/SaturationContext';
import { fetchBudget, budgetToCsv, type BudgetColumn } from '@/lib/budgetCsv';
import type { Project } from '@saturation-api/js';

type Props = {
  projectId?: string;
  projectName?: string;
  columns?: string[];
  phases?: string[];
  ensureLatestProjects?: () => Promise<Project[] | undefined>;
};

export function ExportCsvButton({ projectId, projectName, columns, phases, ensureLatestProjects }: Props) {
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
      toast('Export started', { description: ensureLatestProjects ? 'Refreshing project data…' : 'Loading budget…' });
      let activeProjectName = projectName;
      if (ensureLatestProjects) {
        const projects = await ensureLatestProjects();
        const selected = projects?.find((proj) => proj.id === projectId);
        if (!selected) {
          throw new Error('Selected project is no longer available. Please pick another project and try again.');
        }
        if (selected.name) {
          activeProjectName = selected.name;
        }
      }
      const budget = await fetchBudget(saturation, projectId);
      const csv = budgetToCsv(budget, {
        includeHeaders: true,
        columns: (columns as BudgetColumn[] | undefined),
        phases: phases || undefined,
      });
      const lines = csv.split('\n').filter(Boolean);
      const count = Math.max(0, lines.length - 1); // exclude header

      // Trigger file download
      const name = (activeProjectName?.trim()?.replace(/\s+/g, '_') || 'project') + '_budget.csv';
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
