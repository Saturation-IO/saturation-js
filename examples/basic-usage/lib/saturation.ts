import { Saturation } from '@saturation-api/js';

export function createSaturationClient() {
  const apiKey = process.env.NEXT_PUBLIC_SATURATION_API_KEY;
  
  if (!apiKey) {
    throw new Error('NEXT_PUBLIC_SATURATION_API_KEY is not set in environment variables');
  }

  return new Saturation({
    apiKey,
    baseURL: process.env.NEXT_PUBLIC_SATURATION_API_URL || 'https://api.saturation.io/api/v1',
  });
}