import { useState, useCallback } from "react";

const COLLECTED_KEY = "kpop_collected";
const WISHLIST_KEY = "kpop_wishlist";

function loadSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveSet(key: string, set: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...set]));
}

export function useCollection() {
  const [collected, setCollected] = useState<Set<string>>(() => loadSet(COLLECTED_KEY));
  const [wishlist, setWishlist] = useState<Set<string>>(() => loadSet(WISHLIST_KEY));

  const toggleCollected = useCallback((cardId: string) => {
    setCollected((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) next.delete(cardId);
      else {
        next.add(cardId);
        // Remove from wishlist if added to collected
        setWishlist((w) => {
          const wNext = new Set(w);
          wNext.delete(cardId);
          saveSet(WISHLIST_KEY, wNext);
          return wNext;
        });
      }
      saveSet(COLLECTED_KEY, next);
      return next;
    });
  }, []);

  const toggleWishlist = useCallback((cardId: string) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) next.delete(cardId);
      else {
        next.add(cardId);
        // Remove from collected if added to wishlist
        setCollected((c) => {
          const cNext = new Set(c);
          cNext.delete(cardId);
          saveSet(COLLECTED_KEY, cNext);
          return cNext;
        });
      }
      saveSet(WISHLIST_KEY, next);
      return next;
    });
  }, []);

  const isCollected = useCallback((cardId: string) => collected.has(cardId), [collected]);
  const isWishlisted = useCallback((cardId: string) => wishlist.has(cardId), [wishlist]);

  return { isCollected, isWishlisted, toggleCollected, toggleWishlist };
}
