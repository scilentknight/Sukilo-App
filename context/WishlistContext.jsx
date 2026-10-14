"use client";

import { createContext, useContext, useMemo } from "react";
import { createPersistentStore, parseJsonArray, usePersistentStore } from "@/lib/persistent-store";

/**
 * Wishlist-ready architecture. Persisted to localStorage today; the same
 * provider API can be backed by an authenticated wishlist endpoint later
 * without touching consumers.
 */

const STORAGE_KEY = "sukilo.wishlist";

const isNumber = (value) => typeof value === "number";

const wishlistStore = createPersistentStore(STORAGE_KEY, [], parseJsonArray(isNumber));

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const ids = usePersistentStore(wishlistStore);

  const value = useMemo(
    () => ({
      ids,
      count: ids.length,
      ready: true,
      has: (id) => ids.includes(id),
      toggle: (id) =>
        wishlistStore.set((prev) =>
          prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id],
        ),
      remove: (id) => wishlistStore.set((prev) => prev.filter((n) => n !== id)),
      clear: () => wishlistStore.set([]),
    }),
    [ids],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}
