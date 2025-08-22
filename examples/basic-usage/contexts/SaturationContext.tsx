'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Saturation } from '@saturation-api/js';

interface SaturationContextType {
  client: Saturation | null;
  isInitialized: boolean;
  error: string | null;
  reinitialize: () => void;
}

const SaturationContext = createContext<SaturationContextType | undefined>(undefined);

export function SaturationProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<Saturation | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeClient = () => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_SATURATION_API_KEY || 
                    (typeof window !== 'undefined' ? localStorage.getItem('saturation_api_key') : null);
      
      if (!apiKey) {
        setError('No API key found. Please configure your API key.');
        setClient(null);
        setIsInitialized(true);
        return;
      }

      const saturationClient = new Saturation({
        apiKey,
        baseURL: process.env.NEXT_PUBLIC_SATURATION_API_URL || 'https://api.saturation.io/api/v1'
      });

      setClient(saturationClient);
      setError(null);
      setIsInitialized(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize Saturation client');
      setClient(null);
      setIsInitialized(true);
    }
  };

  useEffect(() => {
    initializeClient();
  }, []);

  const reinitialize = () => {
    setIsInitialized(false);
    initializeClient();
  };

  return (
    <SaturationContext.Provider value={{ client, isInitialized, error, reinitialize }}>
      {children}
    </SaturationContext.Provider>
  );
}

export function useSaturation() {
  const context = useContext(SaturationContext);
  if (context === undefined) {
    throw new Error('useSaturation must be used within a SaturationProvider');
  }
  return context;
}