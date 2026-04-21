import type { CardDetail, CardSummary, CardsResponse, BulkImportResult } from "../types";
import { STATIC_MODE, apiFetch, loadDemoJson, readOnlyError } from "./client";

export interface GetCardsParams {
  search?: string;
  tagIds?: number[];
  page?: number;
  pageSize?: number;
}

export async function getCards(params: GetCardsParams = {}): Promise<CardsResponse> {
  if (STATIC_MODE) return getCardsStatic(params);
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.tagIds?.length) q.set("tagIds", params.tagIds.join(","));
  q.set("page", String(params.page ?? 1));
  q.set("pageSize", String(params.pageSize ?? 24));
  return apiFetch<CardsResponse>(`/api/cards?${q}`);
}

export async function getCard(id: string): Promise<CardDetail> {
  if (STATIC_MODE) {
    const all = await loadDemoJson<CardDetail[]>("cards");
    const found = all.find((c) => c.id === id);
    if (!found) throw new Error("Card not found");
    return found;
  }
  return apiFetch<CardDetail>(`/api/cards/${id}`);
}

export async function createCard(formData: FormData): Promise<CardDetail> {
  if (STATIC_MODE) throw readOnlyError();
  return apiFetch<CardDetail>("/api/cards", { method: "POST", body: formData });
}

export async function updateCard(
  id: string,
  data: { officialCardNumber?: string; notes?: string; tagIds?: number[] }
): Promise<CardDetail> {
  if (STATIC_MODE) throw readOnlyError();
  return apiFetch<CardDetail>(`/api/cards/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteCard(id: string): Promise<void> {
  if (STATIC_MODE) throw readOnlyError();
  return apiFetch<void>(`/api/cards/${id}`, { method: "DELETE" });
}

export async function bulkImport(formData: FormData): Promise<BulkImportResult[]> {
  if (STATIC_MODE) throw readOnlyError();
  return apiFetch<BulkImportResult[]>("/api/cards/bulk-import", { method: "POST", body: formData });
}

async function getCardsStatic(params: GetCardsParams): Promise<CardsResponse> {
  const all = await loadDemoJson<CardDetail[]>("cards");
  let filtered: CardSummary[] = all;

  if (params.search) {
    const s = params.search.trim().toLowerCase();
    filtered = filtered.filter((c) =>
      (c.officialCardNumber?.toLowerCase().includes(s) ?? false) ||
      (c.notes?.toLowerCase().includes(s) ?? false) ||
      c.tags.some((t) => t.name.toLowerCase().includes(s))
    );
  }

  if (params.tagIds?.length) {
    const required = params.tagIds;
    filtered = filtered.filter((c) => {
      const ids = new Set(c.tags.map((t) => t.id));
      return required.every((id) => ids.has(id));
    });
  }

  filtered = [...filtered].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(Math.max(1, params.pageSize ?? 24), 100);
  const start = (page - 1) * pageSize;
  const pageCards = filtered.slice(start, start + pageSize);

  return { total: filtered.length, page, pageSize, cards: pageCards };
}
