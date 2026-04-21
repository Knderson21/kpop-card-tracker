import type { Tag, TagType } from "../types";
import { STATIC_MODE, apiFetch, loadDemoJson, readOnlyError } from "./client";

export async function getTagTypes(): Promise<TagType[]> {
  if (STATIC_MODE) return loadDemoJson<TagType[]>("tag-types");
  return apiFetch<TagType[]>("/api/tag-types");
}

export async function createTagType(name: string): Promise<TagType> {
  if (STATIC_MODE) throw readOnlyError();
  return apiFetch<TagType>("/api/tag-types", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
}

export async function getTags(tagTypeId?: number): Promise<Tag[]> {
  if (STATIC_MODE) {
    const all = await loadDemoJson<Tag[]>("tags");
    return tagTypeId != null ? all.filter((t) => t.tagTypeId === tagTypeId) : all;
  }
  const q = tagTypeId != null ? `?tagTypeId=${tagTypeId}` : "";
  return apiFetch<Tag[]>(`/api/tags${q}`);
}

export async function createTag(name: string, tagTypeId: number): Promise<Tag> {
  if (STATIC_MODE) throw readOnlyError();
  return apiFetch<Tag>("/api/tags", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, tagTypeId }),
  });
}
