'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSaturation } from '@/contexts/SaturationContext';
import { ExportCsvButton } from '@/components/export/ExportCsvButton';
import { ColumnsMultiSelect, type ColumnKey } from '@/components/export/ColumnsMultiSelect';
import { PhasesMultiSelect } from '@/components/export/PhasesMultiSelect';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Phase, Project } from '@saturation-api/js';

export default function ExportPage() {
  const router = useRouter();
  const saturation = useSaturation();

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Selection state for header actions
  const [columnSelection, setColumnSelection] = useState<ColumnKey[]>(['id', 'description']);
  const [phaseSelection, setPhaseSelection] = useState<string[]>([]); // phase aliases

  // Redirect to home if no API key
  useEffect(() => {
    const apiKey = localStorage.getItem('saturation_api_key');
    if (!apiKey) {
      router.push('/');
    }
  }, [router]);

  const loadProjects = useCallback(async (): Promise<Project[]> => {
    try {
      setLoading(true);
      setError(null);
      const res = await saturation.listProjects();
      const list = res.projects || [];
      setProjects(list);
      setSelectedProjectId((current) => {
        if (current && list.some((project) => project.id === current)) {
          return current;
        }
        return list[0]?.id ?? '';
      });
      return list;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load projects';
      setError(message);
      console.error('Error loading projects', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [saturation]);

  useEffect(() => {
    loadProjects().catch(() => undefined);
  }, [loadProjects]);

  useEffect(() => {
    if (selectedProjectId) {
      setPhaseSelection([]);
    }
  }, [selectedProjectId]);

  const handlePhasesLoaded = useCallback((phases: Phase[]) => {
    const aliases = (phases ?? []).map((phase) => phase.alias).filter(Boolean);
    if (aliases.length === 0) return;
    setPhaseSelection((current) => {
      if (current.length === 0) return aliases;
      const aliasSet = new Set(aliases);
      const retained = current.filter((alias) => aliasSet.has(alias));
      const merged = [...retained, ...aliases.filter((alias) => !retained.includes(alias))];
      const unchanged = merged.length === current.length && merged.every((alias, idx) => alias === current[idx]);
      return unchanged ? current : merged;
    });
  }, []);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

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
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Export Options</CardTitle>
              <CardDescription>
                {selectedProjectId ? (
                  <span>
                    Ready to export data for project: <span className="font-medium">{selectedProject?.name ?? 'Unknown project'}</span>
                  </span>
                ) : (
                  <span>Select a project to continue.</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <ColumnsMultiSelect value={columnSelection} onChange={setColumnSelection} />
              <PhasesMultiSelect
                projectId={selectedProjectId}
                value={phaseSelection}
                onChange={setPhaseSelection}
                onLoaded={handlePhasesLoaded}
              />
            </CardContent>
            <CardFooter className="justify-between border-t">
              <div className="text-xs text-muted-foreground">
                CSV export downloads a file to your device.
              </div>
              <div className="flex items-center gap-3">
                <ExportCsvButton
                  projectId={selectedProjectId}
                  projectName={selectedProject?.name || undefined}
                  columns={columnSelection}
                  phases={phaseSelection}
                  ensureLatestProjects={loadProjects}
                />
                <Button variant="outline" disabled={!selectedProjectId}>
                  Export to Google Sheets
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
