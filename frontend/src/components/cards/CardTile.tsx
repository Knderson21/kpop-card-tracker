import { useState } from "react";
import { CheckCircle2, Star } from "lucide-react";
import type { CardSummary } from "../../types";
import { getImageUrl, cn } from "../../lib/utils";

interface CardTileProps {
  card: CardSummary;
  isCollected: boolean;
  isWishlisted: boolean;
  onToggleCollected: (id: string) => void;
  onToggleWishlist: (id: string) => void;
  onClick: (card: CardSummary) => void;
}

export function CardTile({ card, isCollected, isWishlisted, onToggleCollected, onToggleWishlist, onClick }: CardTileProps) {
  const [imgError, setImgError] = useState(false);

  const groupTag = card.tags.find((t) => t.tagTypeName === "Group");
  const memberTag = card.tags.find((t) => t.tagTypeName === "Member");

  return (
    <div
      className="group relative cursor-pointer rounded-lg overflow-hidden border border-border bg-card shadow-sm hover:shadow-md transition-shadow"
      onClick={() => onClick(card)}
    >
      {/* Image */}
      <div className="aspect-[2.5/3.5] bg-muted overflow-hidden">
        {imgError ? (
          <div className="flex h-full items-center justify-center text-muted-foreground text-xs">No image</div>
        ) : (
          <img
            src={getImageUrl(card.imageFileName)}
            alt={[groupTag?.name, memberTag?.name].filter(Boolean).join(" – ") || "Card"}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        )}
      </div>

      {/* Collection status indicator */}
      {isCollected && (
        <div className="absolute top-1.5 left-1.5 rounded-full bg-green-500/90 p-0.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-white" />
        </div>
      )}
      {isWishlisted && !isCollected && (
        <div className="absolute top-1.5 left-1.5 rounded-full bg-yellow-400/90 p-0.5">
          <Star className="h-3.5 w-3.5 text-white fill-white" />
        </div>
      )}

      {/* Hover action buttons */}
      <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className={cn(
            "rounded-full p-1 shadow transition-colors",
            isCollected ? "bg-green-500 text-white" : "bg-card/90 text-muted-foreground hover:text-green-500"
          )}
          title={isCollected ? "Mark as not collected" : "Mark as collected"}
          onClick={(e) => { e.stopPropagation(); onToggleCollected(card.id); }}
        >
          <CheckCircle2 className="h-4 w-4" />
        </button>
        <button
          className={cn(
            "rounded-full p-1 shadow transition-colors",
            isWishlisted ? "bg-yellow-400 text-white" : "bg-card/90 text-muted-foreground hover:text-yellow-500"
          )}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(e) => { e.stopPropagation(); onToggleWishlist(card.id); }}
        >
          <Star className={cn("h-4 w-4", isWishlisted && "fill-white")} />
        </button>
      </div>

      {/* Caption */}
      <div className="p-2">
        <p className="text-xs font-medium truncate text-foreground">
          {groupTag?.name ?? "—"}
          {memberTag && <span className="text-muted-foreground"> · {memberTag.name}</span>}
        </p>
        {card.officialCardNumber && (
          <p className="text-xs text-muted-foreground truncate">#{card.officialCardNumber}</p>
        )}
      </div>
    </div>
  );
}
