import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert a relative media URL to an absolute URL pointing to the backend
 */
export function getMediaUrl(relativePath: string | null | undefined): string {
  if (!relativePath) return '';
  
  // If already an absolute URL, return as is
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  
  // Get the backend base URL from environment or default
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/';
  // Remove /api/ from the end to get the backend root URL
  const backendUrl = apiBaseUrl.replace(/\/api\/?$/, '');
  
  // Ensure relativePath starts with /
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  
  return `${backendUrl}${path}`;
}

export function assetPath(path: string) {
  return `${import.meta.env.VITE_API_BASE_URL || 'localhost:8000'}${path}`;
}