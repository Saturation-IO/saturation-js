'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { Saturation } from '@saturation-api/js';

// Provides a single Saturation SDK client to the app.
// The key is read from env or localStorage for this demo starter.
const SaturationContext = createContext<Saturation | undefined>(undefined);

export function SaturationProvider({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => {
    const apiKey =
      process.env.NEXT_PUBLIC_SATURATION_API_KEY ||
      (typeof window !== 'undefined' ? localStorage.getItem('saturation_api_key') : null) ||
      'demo-api-key';

    return new Saturation({
      apiKey,
      baseURL: process.env.NEXT_PUBLIC_SATURATION_API_URL || 'https://api.saturation.io/api/v1',
    });
  }, []);

  return <SaturationContext.Provider value={client}>{children}</SaturationContext.Provider>;
}

export function useSaturation(): Saturation {
  const context = useContext(SaturationContext);
  if (context === undefined) {
    throw new Error('useSaturation must be used within a SaturationProvider');
  }
  return context;
}


