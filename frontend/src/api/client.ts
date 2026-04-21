export const STATIC_MODE = import.meta.env.VITE_STATIC_MODE === "true";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
const DEMO_BASE = `${import.meta.env.BASE_URL}demo/`;

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

let demoCache: { cards?: unknown; tags?: unknown; tagTypes?: unknown } = {};

export async function loadDemoJson<T>(file: "cards" | "tags" | "tag-types"): Promise<T> {
  const key = file === "tag-types" ? "tagTypes" : (file as "cards" | "tags");
  if (demoCache[key]) return demoCache[key] as T;
  const res = await fetch(`${DEMO_BASE}${file}.json`);
  if (!res.ok) throw new Error(`Failed to load demo data: ${file}`);
  const data = (await res.json()) as T;
  demoCache[key] = data;
  return data;
}

export function demoImageUrl(fileName: string): string {
  return `${DEMO_BASE}images/${fileName}`;
}

export function readOnlyError(): Error {
  return new Error("This is a read-only demo. Upload, edit, and delete are disabled.");
}
