import { useState, useEffect, useCallback, useRef } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { CardSummary, CardDetail, Tag, TagType } from "../types";
import { getCards } from "../api/cards";
import { getTags, getTagTypes } from "../api/tags";
import { useCollection } from "../hooks/useCollection";
import { CardGrid } from "../components/cards/CardGrid";
import { CardDetailModal } from "../components/cards/CardDetailModal";
import { FilterSidebar } from "../components/filters/FilterSidebar";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";

const PAGE_SIZE = 24;

export function GalleryPage() {
  const [cards, setCards] = useState<CardSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<Set<number>>(new Set());

  const [tags, setTags] = useState<Tag[]>([]);
  const [tagTypes, setTagTypes] = useState<TagType[]>([]);

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const { isCollected, isWishlisted, toggleCollected, toggleWishlist } = useCollection();

  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();

  // Load tag types and tags
  useEffect(() => {
    Promise.all([getTagTypes(), getTags()]).then(([types, t]) => {
      setTagTypes(types);
      setTags(t);
    });
  }, []);

  // Debounce search
  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(debounceTimer.current);
  }, [search]);

  // Fetch cards when filters change
  const fetchCards = useCallback(async (pg: number) => {
    setLoading(true);
    try {
      const res = await getCards({
        search: debouncedSearch || undefined,
        tagIds: selectedTagIds.size > 0 ? [...selectedTagIds] : undefined,
        page: pg,
        pageSize: PAGE_SIZE,
      });
      setCards(res.cards);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedTagIds]);

  useEffect(() => {
    setPage(1);
    fetchCards(1);
  }, [fetchCards]);

  const toggleTag = (tagId: number) => {
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      next.has(tagId) ? next.delete(tagId) : next.add(tagId);
      return next;
    });
  };

  const clearFilters = () => {
    setSelectedTagIds(new Set());
    setSearch("");
  };

  const handleCardUpdated = (updated: CardDetail) => {
    setCards((prev) => prev.map((c) => c.id === updated.id ? { ...c, ...updated } : c));
  };

  const handleCardDeleted = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
    setTotal((t) => t - 1);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hasActiveFilters = selectedTagIds.size > 0 || debouncedSearch;

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-4">
      {/* Search bar + mobile filter toggle */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-8"
            placeholder="Search cards, tags, notes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearch("")}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Button
          variant="outline"
          size="icon"
          className={cn("lg:hidden", selectedTagIds.size > 0 && "border-primary text-primary")}
          onClick={() => setMobileSidebarOpen(true)}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Active filter chips */}
      {selectedTagIds.size > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {[...selectedTagIds].map((tagId) => {
            const tag = tags.find((t) => t.id === tagId);
            if (!tag) return null;
            return (
              <button
                key={tagId}
                onClick={() => toggleTag(tagId)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs hover:bg-primary/20 transition-colors"
              >
                {tag.name} <X className="h-3 w-3" />
              </button>
            );
          })}
          <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground px-1">
            Clear all
          </button>
        </div>
      )}

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <div className="hidden lg:block w-56 shrink-0">
          <FilterSidebar
            tagTypes={tagTypes}
            tags={tags}
            selectedTagIds={selectedTagIds}
            onToggleTag={toggleTag}
            onClearAll={clearFilters}
          />
        </div>

        {/* Mobile sidebar overlay */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-card p-4 overflow-y-auto shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold">Filters</h2>
                <button onClick={() => setMobileSidebarOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <FilterSidebar
                tagTypes={tagTypes}
                tags={tags}
                selectedTagIds={selectedTagIds}
                onToggleTag={(id) => { toggleTag(id); }}
                onClearAll={clearFilters}
              />
              <div className="mt-4">
                <Button className="w-full" onClick={() => setMobileSidebarOpen(false)}>
                  Show {total} results
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Results count */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading…" : `${total.toLocaleString()} card${total !== 1 ? "s" : ""}${hasActiveFilters ? " found" : ""}`}
            </p>
          </div>

          {loading && cards.length === 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-[2.5/3.5] rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <CardGrid
              cards={cards}
              isCollected={isCollected}
              isWishlisted={isWishlisted}
              onToggleCollected={toggleCollected}
              onToggleWishlist={toggleWishlist}
              onCardClick={(card) => setSelectedCardId(card.id)}
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => { const p = page - 1; setPage(p); fetchCards(p); }}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => { const p = page + 1; setPage(p); fetchCards(p); }}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Card detail modal */}
      <CardDetailModal
        cardId={selectedCardId}
        isCollected={selectedCardId ? isCollected(selectedCardId) : false}
        isWishlisted={selectedCardId ? isWishlisted(selectedCardId) : false}
        onToggleCollected={toggleCollected}
        onToggleWishlist={toggleWishlist}
        onClose={() => setSelectedCardId(null)}
        onDeleted={handleCardDeleted}
        onUpdated={handleCardUpdated}
      />
    </div>
  );
}
