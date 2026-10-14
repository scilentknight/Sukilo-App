"use client";

import { ProductRail } from "@/components/products/ProductRail";
import { SectionHeading } from "./SectionHeading";
import { recentlyViewedStore } from "@/lib/recently-viewed";
import { usePersistentStore } from "@/lib/persistent-store";

/**
 * Client-only "recently viewed" rail, read from localStorage (via
 * useSyncExternalStore). No backend endpoint is involved; the section hides
 * itself when the list is empty. Snapshots without a price (older entries)
 * are skipped.
 */
export function RecentlyViewed() {
  const items = usePersistentStore(recentlyViewedStore);
  const products = items
    .filter((item) => item.price?.amount && item.price?.currency)
    .map((item) => ({
      id: item.id,
      name: item.name,
      brand: item.brand ?? null,
      category: item.category ?? null,
      description: null,
      price: item.price,
      thumbnail: item.thumbnail,
    }));

  if (products.length === 0) return null;

  return (
    <section aria-labelledby="recently-viewed-heading">
      <SectionHeading title="Recently viewed" subtitle="Pick up where you left off" />
      <ProductRail products={products} />
    </section>
  );
}
