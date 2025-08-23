'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSaturation } from '@/contexts/SaturationContext';

/**
 * Minimal first page: accept a Saturation API key in a Card.
 * - Stores the key in localStorage under 'saturation_api_key'
 * - Mirrors the style and theming of the basic-usage example
 * - No extra features: this is a starter we’ll build on later
 */
export default function Home() {
  const [apiKey, setApiKey] = useState('');
  const [savedKey, setSavedKey] = useState('');
  const client = useSaturation();



  useEffect(() => {
    // Load previously saved key (for demo purposes only).
    const storedKey = localStorage.getItem('saturation_api_key');
    if (storedKey) {
      setSavedKey(storedKey);
      setApiKey(storedKey);
    }
  }, []);

  // Save the key so the SaturationProvider can pick it up on next render.
  const handleSaveApiKey = () => {
    if (apiKey) {
      localStorage.setItem('saturation_api_key', apiKey);
      setSavedKey(apiKey);
    }
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('saturation_api_key');
    setSavedKey('');
    setApiKey('');
  };

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Chatbot Agent (Starter)</h1>
          <p className="text-gray-600">Enter your Saturation API key to begin</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>
              Paste your API key from{' '}
              <a
                href="https://app.saturation.io/settings/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Saturation Settings
              </a>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="sk_test_..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && apiKey) handleSaveApiKey();
                  }}
                />
              </div>

              {savedKey && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">✓ API Key saved to local storage</p>
                  <p className="text-xs text-green-600 mt-1 font-mono">
                    {savedKey.substring(0, 10)}...{savedKey.substring(savedKey.length - 4)}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleSaveApiKey} disabled={!apiKey || apiKey === savedKey} className="flex-1">
                  Save API Key
                </Button>
                {savedKey && (
                  <Button onClick={handleClearApiKey} variant="outline">
                    Clear
                  </Button>
                )}
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Demo note: This stores the key in browser local storage. In production, prefer environment variables.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Only show navigation once an API key is present and client is available */}
        {savedKey && client && (
          <div className="mt-6">
            <a href="/chat" className="block">
              <Button size="lg" className="w-full">
                Go to Chat →
              </Button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
