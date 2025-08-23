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
          <aside className="md:col-span-4 lg:col-span-3 h-full overflow-y-auto md:min-w-[350px]">
            <Card className="gap-0">
              <CardHeader className="pb-0 gap-0">
                <CardTitle>Setup</CardTitle>
                <CardDescription>Configure your OpenAI key for chat.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mt-0">
                  <Button variant="outline" className="whitespace-nowrap" onClick={() => setOpenAIModalOpen(true)}>
                    Setup OpenAI Key
                  </Button>
                  {savedOpenAIKey && (
                    <span className="text-xs text-green-700 border border-green-200 bg-green-50 rounded px-2 py-0.5">
                      ✓ Configured
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  This demo stores your key in local storage. In production, use environment variables or a
                  server-side store.
                </p>
              </CardContent>
            </Card>

            <Card className="mt-4 gap-1">
              <CardHeader className="pb-0">
                <CardTitle className="text-lg md:text-xl leading-tight">Chat Demo</CardTitle>
              </CardHeader>
              <CardContent className="text-sm pt-0 space-y-4 md:space-y-5">
                <p className="mt-0">
                  Welcome! This lightweight chat helps you explore agents and the tools they use with the
                  Saturation SDK. It’s intentionally simple so you can tweak and extend quickly.
                </p>

                <p className="text-xs text-muted-foreground mt-0">
                  Heads up: some chat features may not work yet as this demo is intentionally incomplete.
                </p>

                <p className="font-medium">Getting started</p>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Save your Saturation API key on the home page, then add your OpenAI key here.</li>
                  <li>Send a message to try the Vercel AI SDK v5 streaming flow.</li>
                  <li>Try a simple prompt like <span className="italic">“Show me my projects”</span>.</li>
                  <li>
                    Build tools by adding server code in
                    <code className="mx-1 font-mono">app/api/chat/route.ts</code> (you can also use Prompt‑Kit patterns).
                  </li>
                </ol>

                <p className="text-muted-foreground">
                  Learn more at
                  {" "}
                  <a
                    href="https://docs.saturation.io"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-blue-600 hover:underline"
                  >
                    docs.saturation.io
                  </a>
                  {" "}and the
                  {" "}
                  <a
                    href="https://sdk.vercel.ai/docs"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-blue-600 hover:underline"
                  >
                    Vercel AI SDK docs
                  </a>
                  .
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
