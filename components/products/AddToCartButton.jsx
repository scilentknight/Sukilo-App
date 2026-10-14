"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useLocale } from "@/context/LocaleContext";
import { Button } from "@/components/ui/Button";
import { CartIcon, CheckIcon } from "@/components/ui/icons";
import { toNumber } from "@/lib/format";
import { cn } from "@/lib/cn";

/**
 * Adds a product to the local cart. The cart stores the backend list price and
 * currency (never a converted display price). The API has no stock data, so
 * availability is not enforced here.
 */
export function AddToCartButton({ product, className, fullWidth = true }) {
  const { addItem } = useCart();
  const { t } = useLocale();
  const [added, setAdded] = useState(false);
  const unitPrice = toNumber(product.price?.amount);

  const onAdd = () => {
    if (unitPrice === null) return;
    addItem({
      productId: product.id,
      name: product.name,
      thumbnail: product.thumbnail,
      unitPrice,
      currency: product.price.currency,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  return (
    <Button
      type="button"
      size="sm"
      variant={added ? "secondary" : "primary"}
      onClick={onAdd}
      disabled={unitPrice === null}
      aria-label={`Add ${product.name} to cart`}
      className={cn(fullWidth && "w-full", className)}
    >
      {added ? (
        <>
          <CheckIcon className="h-4 w-4" /> Added
        </>
      ) : (
        <>
          <CartIcon className="h-4 w-4" />
          {t("add_to_cart")}
        </>
      )}
    </Button>
  );
}
