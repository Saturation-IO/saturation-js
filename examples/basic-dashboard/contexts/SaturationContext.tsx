'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { Saturation } from '@saturation-api/js';

const SaturationContext = createContext<Saturation | undefined>(undefined);

export function SaturationProvider({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => {
    // Read API key from localStorage (client-side only)
    const apiKey = process.env.NEXT_PUBLIC_SATURATION_API_KEY || 
                  (typeof window !== 'undefined' ? localStorage.getItem('saturation_api_key') : null) ||
                  'demo-api-key';

    // Always return a client - even with invalid key, let the API handle auth errors
    return new Saturation({
      apiKey,

      /* optional */
      baseURL: process.env.NEXT_PUBLIC_SATURATION_API_URL || 'https://api.saturation.io/api/v1'
    });
  }, []);

  return (
    <SaturationContext.Provider value={client}>
      {children}
    </SaturationContext.Provider>
  );
}

/**
 * Hook to get the Saturation SDK client
 * Always returns a client instance - no null checks needed
 */
export function useSaturation(): Saturation {
  const context = useContext(SaturationContext);
  if (context === undefined) {
    throw new Error('useSaturation must be used within a SaturationProvider');
  }
  return context;
}