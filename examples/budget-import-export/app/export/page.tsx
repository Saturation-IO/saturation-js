'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSaturation } from '@/contexts/SaturationContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import type { Project } from '@saturation-api/js';

export default function ExportPage() {
  const router = useRouter();
  const saturation = useSaturation();

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect to home if no API key
  useEffect(() => {
    const apiKey = localStorage.getItem('saturation_api_key');
    if (!apiKey) {
      router.push('/');
    }
  }, [router]);

  // Load projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await saturation.listProjects();
        const list = res.projects || [];
        setProjects(list);
        if (list.length > 0) {
          setSelectedProjectId(list[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load projects');
        console.error('Error loading projects', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [saturation]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header (similar to basic-dashboard) */}
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/favicon.svg"
                alt="Saturation Logo"
                width={40}
                height={40}
                className="flex-shrink-0"
              />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Budget Export</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Select a project to export data
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Simple native select for projects */}
              {loading ? (
                <select className="h-9 border rounded-md px-3 text-sm bg-transparent" disabled>
                  <option>Loading projects...</option>
                </select>
              ) : error ? (
                <div className="text-sm text-red-600">{error}</div>
              ) : projects.length === 0 ? (
                <div className="text-sm text-muted-foreground">No projects found</div>
              ) : (
                <select
                  className="h-9 border rounded-md px-3 text-sm bg-transparent"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-2">Export Options</h2>
            {selectedProjectId ? (
              <p className="text-sm text-muted-foreground">
                Ready to export data for project: <span className="font-medium">{projects.find(p => p.id === selectedProjectId)?.name}</span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Select a project to continue.</p>
            )}

            {/* Actions */}
            <div className="mt-4 flex items-center gap-3">
              <Button
                disabled={!selectedProjectId}
                onClick={() => {
                  toast("Export started", {
                    description: "Preparing CSV for download...",
                  });
                  setTimeout(() => {
                    toast.success("Export complete", {
                      description: "Your CSV will download shortly.",
                    });
                  }, 800);
                }}
              >
                Export CSV
              </Button>
              <Button variant="outline" disabled={!selectedProjectId}>
                Export to Google Sheets
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
