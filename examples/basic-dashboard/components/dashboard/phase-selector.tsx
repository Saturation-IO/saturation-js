'use client';

import { useState, useEffect } from 'react';
import { useSaturation } from '@/contexts/SaturationContext';
import { Phase } from '@saturation-api/js';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PhaseSelectorProps {
  projectId: string | null;
  onPhaseChange: (phase: Phase | null) => void;
}

export function PhaseSelector({ projectId, onPhaseChange }: PhaseSelectorProps) {
  const saturation = useSaturation();
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPhaseAlias, setSelectedPhaseAlias] = useState<string>('estimate');

  useEffect(() => {
    if (!projectId) {
      setPhases([]);
      return;
    }

    // Fetch phases for the project
    const fetchPhases = async () => {
      try {
        setLoading(true);
        const response = await saturation.listBudgetPhases(projectId);
        // Filter to only show estimate type phases
        const estimatePhases = (response.phases || []).filter(phase => phase.type === 'estimate');
        setPhases(estimatePhases);
        
        // Select "estimate" phase by default (using alias)
        const estimatePhase = estimatePhases.find(p => p.alias === 'estimate' || p.id === 'estimate');
        if (estimatePhase) {
          setSelectedPhaseAlias(estimatePhase.alias);
          onPhaseChange(estimatePhase);
        } else if (estimatePhases.length > 0) {
          // Fallback to first phase if no "estimate" phase found
          setSelectedPhaseAlias(estimatePhases[0].alias);
          onPhaseChange(estimatePhases[0]);
        }
      } catch (err) {
        console.error('Error fetching phases:', err);
        setPhases([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPhases();
  }, [projectId, saturation]);

  const handlePhaseChange = (phaseAlias: string) => {
    setSelectedPhaseAlias(phaseAlias);
    const phase = phases.find(p => p.alias === phaseAlias);
    onPhaseChange(phase || null);
  };

  if (!projectId || phases.length === 0) {
    return null;
  }

  // Get the selected phase object to display its name
  const selectedPhase = phases.find(p => p.alias === selectedPhaseAlias);
  
  return (
    <Select value={selectedPhaseAlias} onValueChange={handlePhaseChange}>
      <SelectTrigger className="w-[180px]" disabled={loading}>
        <SelectValue placeholder="Select phase" />
      </SelectTrigger>
      <SelectContent>
        {phases.map((phase) => (
          <SelectItem key={phase.alias} value={phase.alias}>
            {phase.name || phase.alias}            
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}