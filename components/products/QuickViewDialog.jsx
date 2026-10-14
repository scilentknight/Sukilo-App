"use client";

import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { AddToCartButton } from "./AddToCartButton";
import { ProductPrice } from "./ProductPrice";
import { ButtonLink } from "@/components/ui/Button";

/** Quick-view dialog: a fast summary of a product without leaving the grid. */
export function QuickViewDialog({ product, open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="Quick view" className="sm:max-w-2xl">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-ink-100">
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 90vw, 320px"
              className="object-cover"
            />
          ) : null}
        </div>

        <div className="flex flex-col">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-400">
            {[product.brand, product.category].filter(Boolean).join(" · ")}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-ink-900">{product.name}</h3>
          {product.description ? (
            <p className="mt-3 line-clamp-3 text-sm text-ink-500">{product.description}</p>
          ) : null}

          <div className="mt-4">
            <ProductPrice product={product} className="text-2xl" />
          </div>

          <div className="mt-5 flex flex-col gap-2">
            <AddToCartButton product={product} />
            <ButtonLink href={`/product/${product.id}`} variant="outline" onClick={onClose}>
              View full details
            </ButtonLink>
          </div>
        </div>
      </div>
    </Modal>
  );
}
