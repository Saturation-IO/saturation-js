'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

// Simple UI-friendly phase object
interface SelectedPhase {
  alias: string;
  name: string;
}

interface PhaseContextType {
  selectedPhase: SelectedPhase;
  setSelectedPhase: (phase: SelectedPhase) => void;
}

const PhaseContext = createContext<PhaseContextType | undefined>(undefined);

export function PhaseProvider({ children }: { children: ReactNode }) {
  // Initialize with default estimate phase
  const [selectedPhase, setSelectedPhase] = useState<SelectedPhase>({
    alias: 'estimate',
    name: 'Estimate'
  });

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