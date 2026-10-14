"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { WishlistToggle } from "./WishlistToggle";
import { AddToCartButton } from "./AddToCartButton";
import { QuickViewDialog } from "./QuickViewDialog";
import { ProductPrice } from "./ProductPrice";
import { EyeIcon } from "@/components/ui/icons";
import { addRecentlyViewed } from "@/lib/recently-viewed";
import { cn } from "@/lib/cn";

/**
 * Reusable product card. Every optional field is rendered only when the API
 * provides data. Images use next/image with fixed aspect ratios to prevent CLS.
 */
export function ProductCard({ product, priority = false, className }) {
  const [quickView, setQuickView] = useState(false);

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-ink-200 bg-white transition-shadow duration-200 hover:shadow-md",
        className,
      )}
    >
      <div className="relative">
        <Link
          href={`/product/${product.id}`}
          onClick={() => addRecentlyViewed(product)}
          className="relative focus-ring block aspect-square overflow-hidden bg-ink-50"
          aria-label={product.name}
        >
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.name}
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xs text-ink-400">
              No image
            </span>
          )}
        </Link>

        <div className="absolute right-2 top-2">
          <WishlistToggle productId={product.id} />
        </div>

        <button
          type="button"
          onClick={() => setQuickView(true)}
          aria-label={`Quick view ${product.name}`}
          className="focus-ring absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 bg-white/95 text-ink-600 opacity-0 backdrop-blur transition-opacity hover:text-brand-700 focus-visible:opacity-100 group-hover:opacity-100"
        >
          <EyeIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <p className="line-clamp-1 text-[11px] font-medium uppercase tracking-wide text-ink-400">
          {product.brand ?? product.category}
        </p>

        <h3 className="mt-0.5 line-clamp-2 text-sm font-medium leading-snug text-ink-900">
          <Link
            href={`/product/${product.id}`}
            onClick={() => addRecentlyViewed(product)}
            className="focus-ring rounded hover:text-brand-700"
          >
            {product.name}
          </Link>
        </h3>

        {product.description ? (
          <p className="mt-1 line-clamp-2 hidden text-xs text-ink-500 sm:block">
            {product.description}
          </p>
        ) : null}

        <div className="mt-2">
          <ProductPrice product={product} className="text-base" />
        </div>

        <div className="mt-auto pt-3">
          <AddToCartButton product={product} />
        </div>
      </div>

      <QuickViewDialog product={product} open={quickView} onClose={() => setQuickView(false)} />
    </article>
  );
}
