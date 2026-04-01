import type { CardSummary } from "../../types";
import { CardTile } from "./CardTile";

interface CardGridProps {
  cards: CardSummary[];
  isCollected: (id: string) => boolean;
  isWishlisted: (id: string) => boolean;
  onToggleCollected: (id: string) => void;
  onToggleWishlist: (id: string) => void;
  onCardClick: (card: CardSummary) => void;
}

export function CardGrid({ cards, isCollected, isWishlisted, onToggleCollected, onToggleWishlist, onCardClick }: CardGridProps) {
  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <span className="text-5xl mb-4">🃏</span>
        <p className="text-lg font-medium">No cards found</p>
        <p className="text-sm">Try adjusting your filters or search query.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {cards.map((card) => (
        <CardTile
          key={card.id}
          card={card}
          isCollected={isCollected(card.id)}
          isWishlisted={isWishlisted(card.id)}
          onToggleCollected={onToggleCollected}
          onToggleWishlist={onToggleWishlist}
          onClick={onCardClick}
        />
      ))}
    </div>
  );
}
