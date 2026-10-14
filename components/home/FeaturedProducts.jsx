import { listProducts } from "@/lib/products";
import { ProductGrid } from "@/components/products/ProductGrid";
import { SectionHeading, InlineNotice } from "./SectionHeading";

/** Shared with the hero so both read the same (deduplicated) request. */
export const LATEST_PRODUCTS_QUERY = { limit: 8 };

/**
 * "New arrivals" — the newest products from the API. Server component streamed
 * behind a Suspense boundary on the home page.
 */
export async function FeaturedProducts() {
  let products;
  try {
    products = await listProducts(LATEST_PRODUCTS_QUERY, { next: { revalidate: 300 } });
  } catch {
    return <InlineNotice tone="error" message="Unable to load products. Please refresh." />;
  }

  if (products.items.length === 0) {
    return <InlineNotice message="No products have been listed yet." />;
  }

  return (
    <section aria-labelledby="featured-heading">
      <SectionHeading
        title="New arrivals"
        subtitle="The latest products listed on Sukilo"
        href="/product"
      />
      <ProductGrid products={products.items} priorityCount={4} />
    </section>
  );
}
