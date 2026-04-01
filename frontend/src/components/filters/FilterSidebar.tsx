import { useState } from "react";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import type { Tag, TagType } from "../../types";
import { cn } from "../../lib/utils";

interface FilterSidebarProps {
  tagTypes: TagType[];
  tags: Tag[];
  selectedTagIds: Set<number>;
  onToggleTag: (tagId: number) => void;
  onClearAll: () => void;
}

export function FilterSidebar({ tagTypes, tags, selectedTagIds, onToggleTag, onClearAll }: FilterSidebarProps) {
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

  const tagsByType = tags.reduce<Record<number, Tag[]>>((acc, tag) => {
    if (!acc[tag.tagTypeId]) acc[tag.tagTypeId] = [];
    acc[tag.tagTypeId].push(tag);
    return acc;
  }, {});

  const toggleCollapse = (typeId: number) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(typeId) ? next.delete(typeId) : next.add(typeId);
      return next;
    });
  };

  return (
    <aside className="space-y-1">
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-sm font-semibold text-foreground">Filters</h2>
        {selectedTagIds.size > 0 && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" /> Clear all
          </button>
        )}
      </div>

      {tagTypes.map((tagType) => {
        const typeTags = tagsByType[tagType.id] ?? [];
        if (typeTags.length === 0) return null;
        const isCollapsed = collapsed.has(tagType.id);
        const selectedInType = typeTags.filter((t) => selectedTagIds.has(t.id)).length;

        return (
          <div key={tagType.id} className="border rounded-md border-border overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium bg-muted/50 hover:bg-muted transition-colors"
              onClick={() => toggleCollapse(tagType.id)}
            >
              <span className="flex items-center gap-1.5">
                {tagType.name}
                {selectedInType > 0 && (
                  <span className="rounded-full bg-primary text-primary-foreground text-xs px-1.5 py-0 leading-5 min-w-[1.25rem] text-center">
                    {selectedInType}
                  </span>
                )}
              </span>
              {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            {!isCollapsed && (
              <div className="px-3 py-2 flex flex-wrap gap-1.5">
                {typeTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => onToggleTag(tag.id)}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs border transition-colors",
                      selectedTagIds.has(tag.id)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-primary hover:text-foreground"
                    )}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {tagTypes.length === 0 && (
        <p className="text-xs text-muted-foreground py-4 text-center">No tags yet. Add cards to see filters.</p>
      )}
    </aside>
  );
}
