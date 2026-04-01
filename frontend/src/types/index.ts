export interface TagType {
  id: number;
  name: string;
  isBuiltIn: boolean;
}

export interface Tag {
  id: number;
  name: string;
  tagTypeId: number;
  tagTypeName: string;
}

export interface CardSummary {
  id: string;
  imageFileName: string;
  officialCardNumber: string | null;
  notes: string | null;
  createdAt: string;
  tags: Tag[];
}

export interface CardDetail extends CardSummary {
  updatedAt: string;
}

export interface CardsResponse {
  total: number;
  page: number;
  pageSize: number;
  cards: CardSummary[];
}

export interface BulkImportResult {
  imageFileName: string;
  success: boolean;
  cardId?: string;
  error?: string;
}

export type CollectionStatus = "collected" | "wishlist" | null;
