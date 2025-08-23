'use client';

import { useState, useEffect } from 'react';
import { useSaturation } from '@/contexts/SaturationContext';
import { Project } from '@saturation-api/js';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProjectSelectorProps {
  onProjectChange: (project: Project | null) => void;
}

export function ProjectSelector({ onProjectChange }: ProjectSelectorProps) {
  const saturation = useSaturation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  useEffect(() => {
    // Fetch all projects on mount
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await saturation.listProjects();
        setProjects(response.projects || []);
        
        // Auto-select first project if available
        if (response.projects && response.projects.length > 0) {
          const firstProject = response.projects[0];
          setSelectedProjectId(firstProject.id);
          onProjectChange(firstProject);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load projects');
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [saturation]);

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    const project = projects.find(p => p.id === projectId);
    onProjectChange(project || null);
  };

  if (loading) {
    return (
      <Select>
        <SelectTrigger className="w-[300px]" disabled>
          <SelectValue placeholder="Loading projects..." />
        </SelectTrigger>
      </Select>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600">
        Error loading projects: {error}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-sm text-gray-600">
        No projects found. Create a project in Saturation first.
      </div>
    );
  }

  return (
    <Select value={selectedProjectId} onValueChange={handleProjectChange}>
      <SelectTrigger className="w-[300px]">
        <SelectValue placeholder="Select a project" />
      </SelectTrigger>
      <SelectContent>
        {projects.map((project) => (
          <SelectItem key={project.id} value={project.id}>
            {project.name}
            {project.labels && project.labels.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                {project.labels.map(label => (
                  <span key={label} className="inline-block px-1.5 py-0.5 bg-muted rounded mr-1">
                    {label}
                  </span>
                ))}
              </span>
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}