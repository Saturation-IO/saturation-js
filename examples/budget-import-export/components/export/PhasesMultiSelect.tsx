'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useSaturation } from '@/contexts/SaturationContext';
import type { Phase } from '@saturation-api/js';
import { Check, CheckSquare, Eraser } from 'lucide-react';

type Props = {
  projectId?: string;
  value?: string[]; // phase ids
  onChange?: (phaseIds: string[]) => void;
  onLoaded?: (phases: Phase[]) => void;
  hideInlineActions?: boolean;
};

export function PhasesMultiSelect({ projectId, value, onChange, onLoaded, hideInlineActions }: Props) {
  const saturation = useSaturation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phases, setPhases] = useState<Phase[]>([]);
  // Controlled selection: derive from value
  const selectedSet = useMemo(() => new Set<string>(value ?? []), [value]);

  // No internal selection state to sync

  useEffect(() => {
    const load = async () => {
      if (!projectId) {
        setPhases([]);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        // Load phases list from SDK
        const { phases } = await saturation.listBudgetPhases(projectId);
        setPhases(phases ?? []);
        onLoaded?.(phases ?? []);
        // Initialize selection to all phases if empty
        if ((value ?? []).length === 0) {
          const all = new Set((phases ?? []).map((p) => p.id));
          // Defer notifying parent to after paint to avoid setState-during-render warnings
          setTimeout(() => onChange?.(Array.from(all)), 0);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load phases');
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, saturation]);

  const selected = useMemo(() => Array.from(selectedSet), [selectedSet]);

  const toggle = (id: string) => {
    const next = new Set(selectedSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange?.(Array.from(next));
  };

  const selectAll = () => {
    onChange?.(phases.map((p) => p.id));
  };

  const clearAll = () => {
    onChange?.([]);
  };

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="phases" className="text-sm">
          Phases
        </Label>
        <p className="text-xs text-muted-foreground mt-1">
          Choose which phases to include.
        </p>
      </div>
      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : (
        <div id="phases" className="flex flex-wrap gap-2">
          {loading ? (
            <span className="text-xs text-muted-foreground">Loading phases…</span>
          ) : phases.length === 0 ? (
            <span className="text-xs text-muted-foreground">No phases</span>
          ) : (
            phases.map((phase) => {
              const isActive = selectedSet.has(phase.id);
              return (
                <Button
                  key={phase.id}
                  type="button"
                  variant={isActive ? 'secondary' : 'outline'}
                  size="sm"
                  className="capitalize"
                  aria-pressed={isActive}
                  onClick={() => toggle(phase.id)}
                >
                  {isActive && <Check className="mr-1.5" />}
                  {phase.alias || phase.name || phase.id}
                </Button>
              );
            })
          )}
          {!hideInlineActions && !loading && phases.length > 0 && (
            <div className="flex items-center gap-2 text-xs pl-1" role="group" aria-label="Phase bulk actions">
              <span className="text-muted-foreground">•</span>
              <Button
                variant="link"
                size="sm"
                type="button"
                className="h-6 px-1"
                onClick={selectAll}
                disabled={loading || phases.length === 0}
              >
                <CheckSquare className="mr-1.5 size-3" />
                Select all
              </Button>
              <span className="text-muted-foreground">•</span>
              <Button
                variant="link"
                size="sm"
                type="button"
                className="h-6 px-1"
                onClick={clearAll}
                disabled={loading || phases.length === 0}
              >
                <Eraser className="mr-1.5 size-3" />
                Clear
              </Button>
            </div>
          )}
        </div>
      )}
      {!loading && phases.length > 0 && (
        <div className="mt-1 text-xs text-muted-foreground">{selected.length} of {phases.length} selected</div>
      )}
    </div>
  );
}
