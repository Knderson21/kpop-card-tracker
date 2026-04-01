import type { Tag, TagType } from "../types";
import { apiFetch } from "./client";

export function getTagTypes(): Promise<TagType[]> {
  return apiFetch<TagType[]>("/api/tag-types");
}

export function createTagType(name: string): Promise<TagType> {
  return apiFetch<TagType>("/api/tag-types", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
}

export function getTags(tagTypeId?: number): Promise<Tag[]> {
  const q = tagTypeId != null ? `?tagTypeId=${tagTypeId}` : "";
  return apiFetch<Tag[]>(`/api/tags${q}`);
}

export function createTag(name: string, tagTypeId: number): Promise<Tag> {
  return apiFetch<Tag>("/api/tags", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, tagTypeId }),
  });
}
