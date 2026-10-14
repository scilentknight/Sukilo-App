"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { WishlistToggle } from "./WishlistToggle";
import { ProductPrice } from "./ProductPrice";
import ShareQrDialog from "@/components/barcode/ShareQrDialog";
import {
  CartIcon,
  CheckIcon,
  MinusIcon,
  PlusIcon,
  TruckIcon,
  ShieldCheckIcon,
  RefreshIcon,
} from "@/components/ui/icons";
import { useCart } from "@/context/CartContext";
import { useCountry } from "@/context/CountryContext";
import { useLocale } from "@/context/LocaleContext";
import { toNumber } from "@/lib/format";
import { resolveListPrice } from "@/lib/product";
import { categoryHref } from "@/lib/search-params";

const MAX_QUANTITY = 99;

/**
 * Purchase panel for the product detail page: market price, quantity,
 * add-to-cart and barcode sharing. The cart stores the backend list price.
 */
export function ProductPurchasePanel({ product }) {
  const { countryCode, country } = useCountry();
  const { t } = useLocale();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const unitPrice = toNumber(product.price.amount);
  const converted = resolveListPrice(product, countryCode)?.converted ?? false;

  const onAdd = () => {
    if (unitPrice === null) return;
    addItem({
      productId: product.id,
      name: product.name,
      thumbnail: product.thumbnail,
      unitPrice,
      currency: product.price.currency,
      quantity,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          {product.brand ? (
            <p className="text-xs font-medium uppercase tracking-wide text-brand-700">
              {product.brand}
            </p>
          ) : null}
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink-900">{product.name}</h1>
        </div>
        <WishlistToggle productId={product.id} />
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-ink-400">
        <Link href={categoryHref(product.category)} className="focus-ring rounded hover:text-ink-700">
          {product.category}
        </Link>
        {product.gtin ? (
          <>
            <span className="text-ink-300">·</span>
            <span>GTIN {product.gtin}</span>
          </>
        ) : null}
      </div>

      <div className="rounded-xl border border-ink-200 bg-ink-50/50 p-4">
        <ProductPrice product={product} className="text-3xl" />
        {converted ? (
          <p className="mt-1 text-xs text-amber-600">
            Approximate price converted for display. The seller&apos;s price is{" "}
            {product.price.amount} {product.price.currency}.
          </p>
        ) : (
          <p className="mt-1 text-xs text-ink-400">Price shown for {country.name}</p>
        )}
      </div>

      <p className="flex items-center gap-2 text-sm text-ink-500">
        <TruckIcon className="h-4 w-4 text-ink-400" />
        Delivery in {country.deliveryEstimate}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-lg border border-ink-200">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="focus-ring flex h-10 w-10 items-center justify-center rounded-l-lg text-ink-600 hover:bg-ink-100"
          >
            <MinusIcon className="h-4 w-4" />
          </button>
          <span className="w-12 text-center text-sm font-medium" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))}
            aria-label="Increase quantity"
            className="focus-ring flex h-10 w-10 items-center justify-center rounded-r-lg text-ink-600 hover:bg-ink-100"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>

        <Button
          type="button"
          size="lg"
          variant={added ? "secondary" : "primary"}
          onClick={onAdd}
          disabled={unitPrice === null}
          className="flex-1"
        >
          {added ? (
            <>
              <CheckIcon className="h-4 w-4" /> Added to cart
            </>
          ) : (
            <>
              <CartIcon className="h-4 w-4" /> {t("add_to_cart")}
            </>
          )}
        </Button>
      </div>

      {product.gtin ? (
        <Button type="button" variant="outline" onClick={() => setShareOpen(true)}>
          Share barcode &amp; QR
        </Button>
      ) : null}

      <div className="grid grid-cols-3 gap-3 border-t border-ink-100 pt-4 text-xs text-ink-500">
        <span className="flex flex-col items-center gap-1 text-center">
          <ShieldCheckIcon className="h-5 w-5 text-brand-600" /> Secure payment
        </span>
        <span className="flex flex-col items-center gap-1 text-center">
          <RefreshIcon className="h-5 w-5 text-brand-600" /> 7-day returns
        </span>
        <span className="flex flex-col items-center gap-1 text-center">
          <TruckIcon className="h-5 w-5 text-brand-600" /> Tracked delivery
        </span>
      </div>

      {shareOpen ? (
        <ShareQrDialog
          gtin={product.gtin}
          productName={product.name}
          onClose={() => setShareOpen(false)}
        />
      ) : null}
    </div>
  );
}
