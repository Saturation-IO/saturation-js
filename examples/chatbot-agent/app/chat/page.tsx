"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
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
    <div className="container mx-auto py-16 px-4">
      <div className="max-w-3xl mx-auto">
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

        {/* Chatbot UI wired to main route, passing OpenAI key header for demo */}
        <Chatbot api="/api/chat" headers={savedOpenAIKey ? { 'x-openai-key': savedOpenAIKey } : undefined} />

        {/* Modal to save/clear the OpenAI key */}
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

