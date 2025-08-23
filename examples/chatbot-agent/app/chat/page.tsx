"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ChatPage() {
  // OpenAI key state for the setup modal (demo-only; stored in localStorage)
  const [openAIModalOpen, setOpenAIModalOpen] = useState(false);
  const [openAIKeyInput, setOpenAIKeyInput] = useState('');
  const [savedOpenAIKey, setSavedOpenAIKey] = useState('');

  useEffect(() => {
    // Load any existing OpenAI key for the indicator and modal input
    const storedOpenAI = localStorage.getItem('openai_api_key');
    if (storedOpenAI) {
      setSavedOpenAIKey(storedOpenAI);
      setOpenAIKeyInput(storedOpenAI);
    }
  }, []);

  const handleSaveOpenAIKey = () => {
    if (openAIKeyInput) {
      localStorage.setItem('openai_api_key', openAIKeyInput);
      setSavedOpenAIKey(openAIKeyInput);
      setOpenAIModalOpen(false);
    }
  };

  const handleClearOpenAIKey = () => {
    localStorage.removeItem('openai_api_key');
    setSavedOpenAIKey('');
    setOpenAIKeyInput('');
  };

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Top bar with OpenAI setup action */}
        <div className="flex items-center justify-end mb-4 gap-2">
          {savedOpenAIKey && (
            <span className="text-xs text-green-700 border border-green-200 bg-green-50 rounded px-2 py-0.5">
              ✓ OpenAI Configured
            </span>
          )}
          <Button variant="outline" onClick={() => setOpenAIModalOpen(true)}>
            Setup OpenAI Key
          </Button>
        </div>

        <h1 className="text-4xl font-bold mb-3">Chat</h1>
        <p className="text-gray-600">
          Minimal placeholder. We’ll implement the chatbot/agent features here later.
        </p>

        {/* Simple modal for OpenAI key setup - minimal, no extra deps */}
        {openAIModalOpen && (
          <div
            className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
            role="dialog"
            aria-modal="true"
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpenAIModalOpen(false);
            }}
          >
            <div className="w-full max-w-md">
              <Card>
                <CardHeader>
                  <CardTitle>Setup OpenAI Key</CardTitle>
                  <CardDescription>
                    Store your OpenAI API key locally for demo purposes.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="openai-key">OpenAI API Key</Label>
                      <Input
                        id="openai-key"
                        type="password"
                        placeholder="sk-..."
                        value={openAIKeyInput}
                        onChange={(e) => setOpenAIKeyInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && openAIKeyInput) {
                            handleSaveOpenAIKey();
                          }
                        }}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveOpenAIKey}
                        disabled={!openAIKeyInput || openAIKeyInput === savedOpenAIKey}
                        className="flex-1"
                      >
                        Save Key
                      </Button>
                      {savedOpenAIKey && (
                        <Button variant="outline" onClick={handleClearOpenAIKey}>
                          Clear
                        </Button>
                      )}
                      <Button variant="ghost" onClick={() => setOpenAIModalOpen(false)}>
                        Close
                      </Button>
                    </div>

                    <p className="text-xs text-gray-500">
                      Demo note: Keys are stored in <code>localStorage</code>. In production,
                      prefer secure server-side storage or environment variables.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
