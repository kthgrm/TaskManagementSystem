import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function assetPath(path: string) {
  return `${import.meta.env.VITE_API_BASE_URL || 'localhost:8000'}${path}`;
}