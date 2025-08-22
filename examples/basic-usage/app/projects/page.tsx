'use client';

import { useEffect, useState } from 'react';
import { type Project } from '@saturation-api/js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSaturation } from '@/contexts/SaturationContext';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const client = useSaturation();

  useEffect(() => {
    async function fetchProjects() {
      try {
        const { projects } = await client.listProjects({ status: 'active' });
        setProjects(projects);
        setFetchError(null);
      } catch (err: any) {
        const errorMessage = err?.error?.message || err?.message || 'Failed to fetch projects';
        setFetchError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [client]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Projects</h1>
          <p>Loading projects...</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Projects</h1>
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600">{fetchError}</p>
              <Link href="/">
                <Button className="mt-4">Go to Home</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Active Projects</h1>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>

        {projects.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500">No active projects found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {project.icon && <span>{project.icon}</span>}
                    {project.name}
                  </CardTitle>
                  <CardDescription>
                    ID: {project.id}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Status:</span>
                      <span className={`text-sm font-medium ${
                        project.status === 'active' ? 'text-green-600' : 
                        project.status === 'archived' ? 'text-gray-400' : 
                        'text-yellow-600'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    {project.spaceId && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Space:</span>
                        <span className="text-sm">{project.spaceId}</span>
                      </div>
                    )}
                    {project.labels && project.labels.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-500">Labels:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {project.labels.map((label) => (
                            <span 
                              key={label} 
                              className="text-xs bg-gray-100 px-2 py-1 rounded"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    <Link href={`/projects/${project.id}/budget`}>
                      <Button size="sm" variant="outline">View Budget</Button>
                    </Link>
                    <Link href={`/projects/${project.id}/actuals`}>
                      <Button size="sm" variant="outline">View Actuals</Button>
                    </Link>
                    <Link href={`/projects/${project.id}/purchase-orders`}>
                      <Button size="sm" variant="outline">View POs</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}