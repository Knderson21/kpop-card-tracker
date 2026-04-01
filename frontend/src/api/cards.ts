import type { CardDetail, CardsResponse, BulkImportResult } from "../types";
import { apiFetch } from "./client";

export interface GetCardsParams {
  search?: string;
  tagIds?: number[];
  page?: number;
  pageSize?: number;
}

export function getCards(params: GetCardsParams = {}): Promise<CardsResponse> {
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.tagIds?.length) q.set("tagIds", params.tagIds.join(","));
  q.set("page", String(params.page ?? 1));
  q.set("pageSize", String(params.pageSize ?? 24));
  return apiFetch<CardsResponse>(`/api/cards?${q}`);
}

export function getCard(id: string): Promise<CardDetail> {
  return apiFetch<CardDetail>(`/api/cards/${id}`);
}

export function createCard(formData: FormData): Promise<CardDetail> {
  return apiFetch<CardDetail>("/api/cards", { method: "POST", body: formData });
}

export function updateCard(id: string, data: { officialCardNumber?: string; notes?: string; tagIds?: number[] }): Promise<CardDetail> {
  return apiFetch<CardDetail>(`/api/cards/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function deleteCard(id: string): Promise<void> {
  return apiFetch<void>(`/api/cards/${id}`, { method: "DELETE" });
}

export function bulkImport(formData: FormData): Promise<BulkImportResult[]> {
  return apiFetch<BulkImportResult[]>("/api/cards/bulk-import", { method: "POST", body: formData });
}
