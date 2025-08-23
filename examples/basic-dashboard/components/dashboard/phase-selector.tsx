'use client';

import { useState, useEffect } from 'react';
import { useSaturation } from '@/contexts/SaturationContext';
import { usePhase } from '@/contexts/PhaseContext';
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
}

export function PhaseSelector({ projectId }: PhaseSelectorProps) {
  const saturation = useSaturation();
  const { setSelectedPhase } = usePhase();
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPhaseAlias, setSelectedPhaseAlias] = useState<string>('estimate');

  useEffect(() => {
    if (!projectId) {
      setPhases([]);
      // Set default phase when no project
      setSelectedPhase({ 
        alias: 'estimate', 
        name: 'Estimate'
      });
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
          setSelectedPhase({
            alias: estimatePhase.alias,
            name: estimatePhase.name || estimatePhase.alias
          });
        } else if (estimatePhases.length > 0) {
          // Fallback to first phase if no "estimate" phase found
          const firstPhase = estimatePhases[0];
          setSelectedPhaseAlias(firstPhase.alias);
          setSelectedPhase({
            alias: firstPhase.alias,
            name: firstPhase.name || firstPhase.alias
          });
        } else {
          // No phases available, use default
          setSelectedPhase({ 
            alias: 'estimate', 
            name: 'Estimate'
          });
        }
      } catch (err) {
        console.error('Error fetching phases:', err);
        setPhases([]);
        // Set default phase on error
        setSelectedPhase({ 
          alias: 'estimate', 
          name: 'Estimate'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPhases();
  }, [projectId, saturation, setSelectedPhase]);

  const handlePhaseChange = (phaseAlias: string) => {
    setSelectedPhaseAlias(phaseAlias);
    const phase = phases.find(p => p.alias === phaseAlias);
    if (phase) {
      setSelectedPhase({
        alias: phase.alias,
        name: phase.name || phase.alias
      });
    }
  };

  if (!projectId || phases.length === 0) {
    return null;
  }
  
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