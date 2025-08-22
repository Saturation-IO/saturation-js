'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { type Actual } from '@saturation-api/js';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSaturation } from '@/contexts/SaturationContext';

export default function ActualsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [actuals, setActuals] = useState<Actual[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const client = useSaturation();

  useEffect(() => {
    async function fetchActuals() {
      try {
        const { actuals: actualsData } = await client.listActuals(projectId, {
          expands: ['contact', 'subactual', 'account', 'subactual.account']
        });
        setActuals(actualsData);
        setFetchError(null);
      } catch (err: any) {
        const errorMessage = err?.error?.message || err?.message || 'Failed to fetch actuals';
        setFetchError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchActuals();
  }, [client, projectId]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Actuals for Project {projectId}</h1>
          <p>Loading actuals...</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Actuals for Project {projectId}</h1>
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
          <h1 className="text-3xl font-bold">Actuals for Project {projectId}</h1>
          <Link href="/projects">
            <Button variant="outline">Back to Projects</Button>
          </Link>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <pre className="overflow-auto text-sm">
            {JSON.stringify(actuals, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}