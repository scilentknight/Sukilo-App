"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { createPersistentStore, usePersistentStore } from "@/lib/persistent-store";

/**
 * Cart-ready architecture. The reducer-free store already models variants,
 * vendors, per-item currency and stock so a future multi-vendor checkout
 * endpoint can consume it verbatim. Persisted to localStorage; the API exposes
 * no cart/order endpoint yet.
 */

const STORAGE_KEY = "sukilo.cart";

export function cartItemKey(item) {
  return `${item.productId}:${item.variantId ?? "base"}`;
}

const isCartItem = (value) =>
  typeof value === "object" &&
  value !== null &&
  "productId" in value &&
  "unitPrice" in value &&
  "quantity" in value;

const cartStore = createPersistentStore(STORAGE_KEY, [], (raw) => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCartItem);
  } catch {
    return [];
  }
});

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const items = usePersistentStore(cartStore);

  const addItem = useCallback((item) => {
    const quantity = item.quantity ?? 1;
    cartStore.set((prev) => {
      const key = cartItemKey(item);
      const existing = prev.find((i) => cartItemKey(i) === key);
      if (existing) {
        return prev.map((i) =>
          cartItemKey(i) === key
            ? { ...i, quantity: Math.min(i.quantity + quantity, i.stock || Infinity) }
            : i,
        );
      }
      return [...prev, { ...item, quantity }];
    });
  }, []);

  const removeItem = useCallback((productId, variantId) => {
    const key = cartItemKey({ productId, variantId });
    cartStore.set((prev) => prev.filter((i) => cartItemKey(i) !== key));
  }, []);

  const setQuantity = useCallback((productId, quantity, variantId) => {
    const key = cartItemKey({ productId, variantId });
    cartStore.set((prev) =>
      prev.map((i) =>
        cartItemKey(i) === key
          ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock || Infinity)) }
          : i,
      ),
    );
  }, []);

  const clear = useCallback(() => cartStore.set([]), []);

  const value = useMemo(() => {
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    // Items keep their listing currency, so totals are per currency (never summed across).
    const totalsByCurrency = new Map();
    for (const i of items) {
      totalsByCurrency.set(i.currency, (totalsByCurrency.get(i.currency) ?? 0) + i.unitPrice * i.quantity);
    }
    const totals = [...totalsByCurrency].map(([currency, amount]) => ({ currency, amount }));
    return { items, count, totals, addItem, removeItem, setQuantity, clear, ready: true };
  }, [items, addItem, removeItem, setQuantity, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
