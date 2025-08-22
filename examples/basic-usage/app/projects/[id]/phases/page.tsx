'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { type Phase } from '@saturation-api/js';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSaturation } from '@/contexts/SaturationContext';

export default function PhasesPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [phases, setPhases] = useState<Phase[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const client = useSaturation();

  useEffect(() => {
    async function fetchPhases() {
      try {
        const { phases: phasesData } = await client.listBudgetPhases(projectId);
        setPhases(phasesData);
        setFetchError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch phases';
        setFetchError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchPhases();
  }, [client, projectId]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Phases for Project {projectId}</h1>
          <p>Loading phases...</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Phases for Project {projectId}</h1>
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
            <p className="text-red-600">{fetchError}</p>
          </div>
          <Link href="/projects">
            <Button>Back to Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Phases for Project {projectId}</h1>
          <Link href="/projects">
            <Button variant="outline">Back to Projects</Button>
          </Link>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <pre className="overflow-auto text-sm">
            {JSON.stringify(phases, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}