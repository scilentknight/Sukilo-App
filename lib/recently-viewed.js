import { createPersistentStore, parseJsonArray } from "./persistent-store";

/**
 * Recently viewed products are a client-only concern. We store a compact,
 * serialisable snapshot in `localStorage` so the home page can render the rail
 * without extra API round-trips. Marked clearly as a frontend feature.
 */

const KEY = "sukilo.recently-viewed";
const MAX_ITEMS = 12;
const UPDATE_EVENT = "recently-viewed:updated";

function isRecentlyViewedItem(value) {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value
  );
}

export const recentlyViewedStore = createPersistentStore(
  KEY,
  [],
  parseJsonArray(isRecentlyViewedItem),
  [UPDATE_EVENT],
);

export function getRecentlyViewed() {
  return recentlyViewedStore.get();
}

export function addRecentlyViewed(product) {
  recentlyViewedStore.set((current) => {
    const entry = {
      id: product.id,
      name: product.name,
      thumbnail: product.thumbnail ?? null,
      price: product.price ?? null,
      viewedAt: Date.now(),
    };
    return [entry, ...current.filter((item) => item.id !== entry.id)].slice(0, MAX_ITEMS);
  });
  // Notify any non-react listeners (e.g. the home rail).
  if (typeof window !== "undefined") window.dispatchEvent(new Event(UPDATE_EVENT));
}
