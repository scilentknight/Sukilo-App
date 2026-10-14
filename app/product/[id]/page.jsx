import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api";
import { getProduct } from "@/lib/products";
import { categoryHref } from "@/lib/search-params";
import { ProductGallery } from "@/components/products/ProductGallery";
import { ProductPurchasePanel } from "@/components/products/ProductPurchasePanel";
import { RelatedProducts } from "@/components/products/RelatedProducts";
import { RecentlyViewedTracker } from "@/components/products/RecentlyViewedTracker";

// Revalidate product pages periodically; dynamic content is per-id.
export const revalidate = 300;

// `cache` memoises the fetch so generateMetadata + the page share one request.
const loadProduct = cache(async (id) => {
  try {
    return await getProduct(id, { next: { revalidate: 300 } });
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 422)) return null;
    throw error;
  }
});

function parseId(id) {
  return /^\d+$/.test(id) ? Number(id) : null;
}

export async function generateMetadata({ params }) {
  const productId = parseId((await params).id);
  const product = productId ? await loadProduct(productId).catch(() => null) : null;
  if (!product) return { title: "Product not found" };

  const description = product.description?.slice(0, 160) || `Buy ${product.name} online at Sukilo.`;
  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      type: "website",
      images: product.thumbnail ? [{ url: product.thumbnail }] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }) {
  const productId = parseId((await params).id);
  if (!productId) notFound();

  let product;
  try {
    product = await loadProduct(productId);
  } catch {
    throw new Error("Unable to load this product. Please try again later.");
  }
  if (!product) notFound();

  // Compact snapshot for the recently-viewed rail.
  const snapshot = {
    id: product.id,
    name: product.name,
    brand: product.brand,
    category: product.category,
    price: product.price,
    thumbnail: product.thumbnail,
  };

  return (
    <div className="container-page py-6">
      <RecentlyViewedTracker product={snapshot} />

      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-ink-400">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="focus-ring rounded hover:text-ink-700">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link
              href={categoryHref(product.category)}
              className="focus-ring rounded hover:text-ink-700"
            >
              {product.category}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="line-clamp-1 text-ink-700" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />
        <ProductPurchasePanel product={product} />
      </div>

      <section aria-labelledby="description-heading" className="mt-10 max-w-3xl">
        <h2 id="description-heading" className="text-lg font-bold text-ink-900">
          Product description
        </h2>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-600">
          {product.description || "No description available for this product."}
        </p>
      </section>

      <div className="mt-12">
        <RelatedProducts productId={product.id} category={product.category} />
      </div>
    </div>
  );
}
