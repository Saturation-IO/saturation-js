"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type OpenAIKeyModalProps = {
  open: boolean;
  initialKey?: string;
  onClose: () => void;
  onSaved: (key: string) => void;
  onCleared: () => void;
};

export function OpenAIKeyModal({ open, initialKey, onClose, onSaved, onCleared }: OpenAIKeyModalProps) {
  const [value, setValue] = useState(initialKey ?? '');

  // Sync local input whenever parent key changes or modal re-opens
  useEffect(() => {
    if (open) setValue(initialKey ?? '');
  }, [open, initialKey]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Setup OpenAI Key</CardTitle>
            <CardDescription>Store your OpenAI API key locally for demo purposes.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="openai-key">OpenAI API Key</Label>
                <Input
                  id="openai-key"
                  type="password"
                  placeholder="sk-..."
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && value) onSaved(value);
                  }}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={() => value && onSaved(value)} disabled={!value} className="flex-1">
                  Save Key
                </Button>
                {initialKey && initialKey.length > 0 && (
                  <Button variant="outline" onClick={onCleared}>
                    Clear
                  </Button>
                )}
                <Button variant="ghost" onClick={onClose}>
                  Close
                </Button>
              </div>

              <p className="text-xs text-gray-500">
                Demo note: Keys are stored in <code>localStorage</code>. In production, prefer secure server-side
                storage or environment variables.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

