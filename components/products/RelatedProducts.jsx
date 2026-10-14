import { listProducts } from "@/lib/products";
import { ProductRail } from "@/components/products/ProductRail";
import { SectionHeading, InlineNotice } from "@/components/home/SectionHeading";
import { categoryHref } from "@/lib/search-params";

/** Other products from the same category (newest first). Hidden when there are none. */
export async function RelatedProducts({ productId, category }) {
  let related;
  try {
    related = await listProducts({ category, limit: 11 }, { next: { revalidate: 300 } });
  } catch {
    return <InlineNotice tone="error" message="Unable to load related products." />;
  }

  const items = related.items.filter((item) => item.id !== productId).slice(0, 10);
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="related-heading">
      <SectionHeading
        title="You may also like"
        subtitle={`More from ${category}`}
        href={categoryHref(category)}
      />
      <ProductRail products={items} />
    </section>
  );
}
