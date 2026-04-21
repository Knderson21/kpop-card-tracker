import { useState, useEffect } from "react";
import { CheckCircle2, Star, Pencil, Trash2, X, Loader2 } from "lucide-react";
import type { CardDetail, Tag, TagType } from "../../types";
import { getCard, updateCard, deleteCard } from "../../api/cards";
import { getTags, getTagTypes, createTag } from "../../api/tags";
import { STATIC_MODE } from "../../api/client";
import { getImageUrl, cn } from "../../lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface CardDetailModalProps {
  cardId: string | null;
  isCollected: boolean;
  isWishlisted: boolean;
  onToggleCollected: (id: string) => void;
  onToggleWishlist: (id: string) => void;
  onClose: () => void;
  onDeleted: (id: string) => void;
  onUpdated: (card: CardDetail) => void;
}

export function CardDetailModal({
  cardId,
  isCollected,
  isWishlisted,
  onToggleCollected,
  onToggleWishlist,
  onClose,
  onDeleted,
  onUpdated,
}: CardDetailModalProps) {
  const [card, setCard] = useState<CardDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [tagTypes, setTagTypes] = useState<TagType[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<number>>(new Set());
  const [notes, setNotes] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagTypeId, setNewTagTypeId] = useState<number | "">("");
  const [tagError, setTagError] = useState("");

  useEffect(() => {
    if (!cardId) return;
    setLoading(true);
    setEditing(false);
    getCard(cardId)
      .then((c) => {
        setCard(c);
        setSelectedTagIds(new Set(c.tags.map((t) => t.id)));
        setNotes(c.notes ?? "");
        setCardNumber(c.officialCardNumber ?? "");
      })
      .finally(() => setLoading(false));
  }, [cardId]);

  useEffect(() => {
    if (!editing) return;
    Promise.all([getTags(), getTagTypes()]).then(([tags, types]) => {
      setAllTags(tags);
      setTagTypes(types);
    });
  }, [editing]);

  const handleSave = async () => {
    if (!card) return;
    setSaving(true);
    try {
      const updated = await updateCard(card.id, {
        officialCardNumber: cardNumber || undefined,
        notes: notes || undefined,
        tagIds: [...selectedTagIds],
      });
      setCard(updated);
      setEditing(false);
      onUpdated(updated);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!card || !confirm("Delete this card? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await deleteCard(card.id);
      onDeleted(card.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  const handleAddTag = async () => {
    if (!newTagName.trim() || newTagTypeId === "") { setTagError("Name and tag type required."); return; }
    setTagError("");
    try {
      const tag = await createTag(newTagName.trim(), Number(newTagTypeId));
      setAllTags((prev) => [...prev, tag]);
      setSelectedTagIds((prev) => new Set([...prev, tag.id]));
      setNewTagName("");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error";
      setTagError(msg);
    }
  };

  const tagsByType = allTags.reduce<Record<string, Tag[]>>((acc, tag) => {
    const key = tag.tagTypeName;
    if (!acc[key]) acc[key] = [];
    acc[key].push(tag);
    return acc;
  }, {});

  return (
    <Dialog open={!!cardId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        {!loading && card && (
          <>
            <DialogHeader>
              <DialogTitle className="text-base">
                {card.tags.find((t) => t.tagTypeName === "Group")?.name ?? "Card"}{" "}
                {card.tags.find((t) => t.tagTypeName === "Member") && (
                  <span className="text-muted-foreground font-normal">
                    · {card.tags.find((t) => t.tagTypeName === "Member")?.name}
                  </span>
                )}
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Image */}
              <div className="sm:w-48 shrink-0">
                <img
                  src={getImageUrl(card.imageFileName)}
                  alt="Card"
                  className="w-full rounded-lg border border-border object-cover"
                />
                {/* Status buttons */}
                <div className="flex gap-2 mt-2">
                  <button
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1 rounded-md py-1.5 text-xs font-medium transition-colors",
                      isCollected ? "bg-green-500 text-white" : "bg-muted text-muted-foreground hover:bg-green-100 hover:text-green-700"
                    )}
                    onClick={() => onToggleCollected(card.id)}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {isCollected ? "Collected" : "Collect"}
                  </button>
                  <button
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1 rounded-md py-1.5 text-xs font-medium transition-colors",
                      isWishlisted ? "bg-yellow-400 text-white" : "bg-muted text-muted-foreground hover:bg-yellow-100 hover:text-yellow-700"
                    )}
                    onClick={() => onToggleWishlist(card.id)}
                  >
                    <Star className={cn("h-3.5 w-3.5", isWishlisted && "fill-white")} />
                    {isWishlisted ? "Wishlisted" : "Wishlist"}
                  </button>
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 space-y-3 min-w-0">
                {!editing ? (
                  <>
                    {/* View mode */}
                    {card.officialCardNumber && (
                      <p className="text-sm text-muted-foreground">Card #{card.officialCardNumber}</p>
                    )}
                    {card.notes && <p className="text-sm">{card.notes}</p>}

                    {/* Tags grouped by type */}
                    <div className="space-y-1.5">
                      {Object.entries(
                        card.tags.reduce<Record<string, Tag[]>>((acc, tag) => {
                          if (!acc[tag.tagTypeName]) acc[tag.tagTypeName] = [];
                          acc[tag.tagTypeName].push(tag);
                          return acc;
                        }, {})
                      ).map(([typeName, tags]) => (
                        <div key={typeName} className="flex flex-wrap items-center gap-1">
                          <span className="text-xs text-muted-foreground w-20 shrink-0">{typeName}</span>
                          {tags.map((tag) => (
                            <Badge key={tag.id} variant="secondary">{tag.name}</Badge>
                          ))}
                        </div>
                      ))}
                    </div>

                    {!STATIC_MODE && (
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                          <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={handleDelete} disabled={deleting}>
                          {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5 mr-1" />}
                          Delete
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Edit mode */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Card Number</label>
                      <Input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="e.g. PC-01" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Notes</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm resize-none h-20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        placeholder="Optional notes..."
                      />
                    </div>

                    {/* Tag selection */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Tags</label>
                      <div className="max-h-40 overflow-y-auto space-y-1.5 border rounded-md p-2">
                        {Object.entries(tagsByType).map(([typeName, tags]) => (
                          <div key={typeName}>
                            <p className="text-xs text-muted-foreground mb-1">{typeName}</p>
                            <div className="flex flex-wrap gap-1">
                              {tags.map((tag) => (
                                <button
                                  key={tag.id}
                                  onClick={() => setSelectedTagIds((prev) => {
                                    const next = new Set(prev);
                                    next.has(tag.id) ? next.delete(tag.id) : next.add(tag.id);
                                    return next;
                                  })}
                                  className={cn(
                                    "px-2 py-0.5 rounded-full text-xs border transition-colors",
                                    selectedTagIds.has(tag.id)
                                      ? "bg-primary text-primary-foreground border-primary"
                                      : "bg-background text-muted-foreground border-border hover:border-primary"
                                  )}
                                >
                                  {tag.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Add new tag inline */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Add new tag</label>
                      <div className="flex gap-1">
                        <select
                          value={newTagTypeId}
                          onChange={(e) => setNewTagTypeId(e.target.value === "" ? "" : Number(e.target.value))}
                          className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                        >
                          <option value="">Type…</option>
                          {tagTypes.map((tt) => <option key={tt.id} value={tt.id}>{tt.name}</option>)}
                        </select>
                        <Input
                          className="h-8 text-xs"
                          value={newTagName}
                          onChange={(e) => setNewTagName(e.target.value)}
                          placeholder="Tag name"
                          onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                        />
                        <Button size="sm" variant="outline" onClick={handleAddTag}>Add</Button>
                      </div>
                      {tagError && <p className="text-xs text-red-500">{tagError}</p>}
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSave} disabled={saving}>
                        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />} Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                        <X className="h-3.5 w-3.5 mr-1" /> Cancel
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
