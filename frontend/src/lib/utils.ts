import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { STATIC_MODE, demoImageUrl } from "../api/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getImageUrl(fileName: string): string {
  if (STATIC_MODE) return demoImageUrl(fileName);
  return `${import.meta.env.VITE_API_URL ?? "http://localhost:5000"}/images/${fileName}`;
}
