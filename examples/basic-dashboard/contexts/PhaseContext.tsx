'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { Phase } from '@saturation-api/js';

interface PhaseContextType {
  selectedPhase: Phase;
  setSelectedPhase: (phase: Phase) => void;
}

const PhaseContext = createContext<PhaseContextType | undefined>(undefined);

export function PhaseProvider({ children }: { children: ReactNode }) {
  // Initialize with default estimate phase
  const [selectedPhase, setSelectedPhase] = useState<Phase>({
    id: 'estimate',
    alias: 'estimate',
    name: 'Estimate',
    type: 'estimate'
  } as Phase);

  return (
    <PhaseContext.Provider value={{ selectedPhase, setSelectedPhase }}>
      {children}
    </PhaseContext.Provider>
  );
}

export function usePhase() {
  const context = useContext(PhaseContext);
  if (context === undefined) {
    throw new Error('usePhase must be used within a PhaseProvider');
  }
  return context;
}