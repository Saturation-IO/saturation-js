import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility to merge Tailwind classes with conditional variants
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

