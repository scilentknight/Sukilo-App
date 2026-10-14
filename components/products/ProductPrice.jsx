"use client";

import { useHydrated } from "@/hooks/useHydrated";
import { useCountry } from "@/context/CountryContext";
import { useCurrency } from "@/context/CurrencyContext";
import { resolveListPrice } from "@/lib/product";
import { cn } from "@/lib/cn";

/**
 * Product price in the active market currency. Rendered after hydration because
 * the market comes from localStorage; converted prices are marked approximate.
 */
export function ProductPrice({ product, className }) {
  const hydrated = useHydrated();
  const { countryCode } = useCountry();
  const { format } = useCurrency();
  const price = resolveListPrice(product, countryCode);

  if (!price) return <span className="text-sm text-ink-400">Price unavailable</span>;

  return (
    <span
      className={cn("font-bold text-ink-900", className)}
      title={price.converted ? `Listed at ${product.price.amount} ${product.price.currency}` : undefined}
    >
      {hydrated ? `${price.converted ? "≈ " : ""}${format(price.amount, price.currency)}` : "\u00A0"}
    </span>
  );
}
