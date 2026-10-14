"use client";

import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "./ProductCard";
import { WishlistToggle } from "./WishlistToggle";
import { AddToCartButton } from "./AddToCartButton";
import { ProductPrice } from "./ProductPrice";
import { addRecentlyViewed } from "@/lib/recently-viewed";

/** Grid layout of product cards. */
export function ProductResultsGrid({ products }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

/** Horizontal list layout used by the toolbar's list view toggle. */
export function ProductResultsList({ products }) {
  return (
    <div className="flex flex-col gap-3">
      {products.map((product) => (
        <ListProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function ListProductCard({ product }) {
  return (
    <article className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-ink-200 bg-white p-3 transition-shadow hover:shadow-md sm:flex-row">
      <Link
        href={`/product/${product.id}`}
        onClick={() => addRecentlyViewed(product)}
        className="focus-ring relative aspect-square w-full shrink-0 overflow-hidden rounded-lg bg-ink-50 sm:h-40 sm:w-40"
        aria-label={product.name}
      >
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.name}
            fill
            sizes="160px"
            className="object-cover"
          />
        ) : null}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">
              {[product.brand, product.category].filter(Boolean).join(" · ")}
            </p>
            <h3 className="line-clamp-2 text-sm font-medium text-ink-900">
              <Link
                href={`/product/${product.id}`}
                onClick={() => addRecentlyViewed(product)}
                className="focus-ring rounded hover:text-brand-700"
              >
                {product.name}
              </Link>
            </h3>
          </div>
          <WishlistToggle productId={product.id} size="sm" />
        </div>

        {product.description ? (
          <p className="mt-1 line-clamp-2 text-xs text-ink-500">{product.description}</p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
          <ProductPrice product={product} className="text-lg" />
          <AddToCartButton product={product} fullWidth={false} className="min-w-36" />
        </div>
      </div>
    </article>
  );
}
