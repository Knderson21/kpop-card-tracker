import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getImageUrl(fileName: string): string {
  return `${import.meta.env.VITE_API_URL ?? "http://localhost:5000"}/images/${fileName}`;
}
