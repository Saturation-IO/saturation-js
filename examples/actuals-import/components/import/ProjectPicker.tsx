"use client";

import { useMemo, useState } from "react";
import type { Project } from "@saturation-api/js";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

const ChevronsDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m7 7 5 5 5-5" />
    <path d="m7 13 5 5 5-5" />
  </svg>
);

const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const Spinner = () => (
  <svg
    className="size-4 animate-spin text-muted-foreground"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 0 1 8-8v4l3-3-3-3v4a12 12 0 0 0-12 12h4Z"
    />
  </svg>
);

type ProjectPickerProps = {
  projects: Project[];
  value: string;
  onChange: (projectId: string) => void;
  loading?: boolean;
  error?: string | null;
  className?: string;
};

export function ProjectPicker({
  projects,
  value,
  onChange,
  loading = false,
  error,
  className,
}: ProjectPickerProps) {
  const [open, setOpen] = useState(false);

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      const nameA = (a.name ?? a.id ?? "").toLowerCase();
      const nameB = (b.name ?? b.id ?? "").toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });
  }, [projects]);

  const selectedProject = useMemo(
    () => sortedProjects.find((project) => project.id === value) ?? null,
    [sortedProjects, value],
  );

  if (loading) {
    return (
      <div className={cn("flex h-9 min-w-[12rem] items-center gap-2 rounded-md border px-3 text-sm text-muted-foreground", className)}>
        <Spinner />
        Loading projects…
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("flex min-w-[12rem] items-center rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700", className)}>
        {error}
      </div>
    );
  }

  if (sortedProjects.length === 0) {
    return (
      <div className={cn("flex h-9 min-w-[12rem] items-center rounded-md border px-3 text-sm text-muted-foreground", className)}>
        No projects found
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-9 min-w-[12rem] items-center justify-between gap-2 rounded-md border bg-background px-3 text-sm ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className,
          )}
        >
          <span className="truncate text-left">
            {selectedProject ? selectedProject.name || selectedProject.id : "Select a project"}
          </span>
          <ChevronsDownIcon className="size-4 text-muted-foreground" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="end">
        <Command shouldFilter>
          <CommandInput placeholder="Search projects…" />
          <CommandEmpty>No matching projects.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {sortedProjects.map((project) => {
                const label = project.name || project.id;
                return (
                  <CommandItem
                    key={project.id}
                    value={`${label} ${project.id}`}
                    onSelect={() => {
                      onChange(project.id);
                      setOpen(false);
                    }}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 size-4",
                        project.id === value ? "opacity-100" : "opacity-0",
                      )}
                      aria-hidden
                    />
                    <span className="flex flex-col">
                      <span className="text-sm text-foreground">{label}</span>
                      {project.id !== label && (
                        <span className="text-xs text-muted-foreground">{project.id}</span>
                      )}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
