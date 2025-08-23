"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Chatbot from '@/components/primitives/chatbot';
import { OpenAIKeyModal } from '@/components/openai/OpenAIKeyModal';

export default function ChatPage() {
  // OpenAI key state (demo-only; stored in localStorage)
  const [openAIModalOpen, setOpenAIModalOpen] = useState(false);
  const [savedOpenAIKey, setSavedOpenAIKey] = useState('');

  useEffect(() => {
    const storedOpenAI = localStorage.getItem('openai_api_key');
    if (storedOpenAI) setSavedOpenAIKey(storedOpenAI);
  }, []);

  const handleSaveOpenAIKey = (key: string) => {
    localStorage.setItem('openai_api_key', key);
    setSavedOpenAIKey(key);
    setOpenAIModalOpen(false);
  };

  const handleClearOpenAIKey = () => {
    localStorage.removeItem('openai_api_key');
    setSavedOpenAIKey('');
  };

  return (
    <div className="w-full h-screen overflow-hidden py-4 px-4">
      <div className="w-full h-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full">
          {/* Sidebar: smaller left pane for setup */}
          <aside className="md:col-span-4 lg:col-span-3 h-full overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle>Setup</CardTitle>
                <CardDescription>Configure your OpenAI key for chat.</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setOpenAIModalOpen(true)}>
                    Setup OpenAI Key
                  </Button>
                  {savedOpenAIKey && (
                    <span className="text-xs text-green-700 border border-green-200 bg-green-50 rounded px-2 py-0.5">
                      ✓ OpenAI Configured
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  This demo stores your key in local storage. In production, use environment variables or a
                  server-side store.
                </p>
              </CardContent>
            </Card>
          </aside>

          {/* Main chat area */}
          <main className="md:col-span-8 lg:col-span-9 h-full min-h-0 flex flex-col">
            <Chatbot
              api="/api/chat"
              headers={savedOpenAIKey ? { 'x-openai-key': savedOpenAIKey } : undefined}
              fullHeight
            />
          </main>
        </div>

        {/* Modal to save/clear the OpenAI key (unchanged) */}
        <OpenAIKeyModal
          open={openAIModalOpen}
          initialKey={savedOpenAIKey}
          onClose={() => setOpenAIModalOpen(false)}
          onSaved={handleSaveOpenAIKey}
          onCleared={handleClearOpenAIKey}
        />
      </div>
    </div>
  );
}
