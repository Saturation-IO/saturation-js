'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Home() {
  const [apiKey, setApiKey] = useState('');
  const [savedKey, setSavedKey] = useState('');

  useEffect(() => {
    // Load API key from localStorage on mount
    const storedKey = localStorage.getItem('saturation_api_key');
    if (storedKey) {
      setSavedKey(storedKey);
      setApiKey(storedKey);
    }
  }, []);

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
          <h1 className="text-4xl font-bold mb-2">Saturation Dashboard</h1>
          <p className="text-gray-600">Configure your API key to get started</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>
              Enter your Saturation API key to get started. Get your key from{' '}
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
                    if (e.key === 'Enter' && apiKey) {
                      handleSaveApiKey();
                    }
                  }}
                />
              </div>
              
              {savedKey && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">
                    ✓ API Key loaded from local storage
                  </p>
                  <p className="text-xs text-green-600 mt-1 font-mono">
                    {savedKey.substring(0, 10)}...{savedKey.substring(savedKey.length - 4)}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={handleSaveApiKey} 
                  disabled={!apiKey || apiKey === savedKey}
                  className="flex-1"
                >
                  Save API Key
                </Button>
                {savedKey && (
                  <Button 
                    onClick={handleClearApiKey}
                    variant="outline"
                  >
                    Clear
                  </Button>
                )}
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Note: This stores the key in browser local storage for demo purposes only. 
                In production, use environment variables.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}