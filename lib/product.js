import { getCountry } from "@/config/locales";
import { toNumber } from "./format";

/**
 * Display price for the active market.
 *
 * Products carry one price in one currency. When that currency differs from
 * the market currency we show a display-only conversion using the static rates
 * in `config/locales` and flag it as `converted` so the UI can mark it as
 * approximate. Checkout amounts must always come from the backend price.
 */
export function resolveListPrice(product, countryCode) {
  const amount = toNumber(product.price?.amount);
  if (amount === null) return null;

  const listCurrency = product.price.currency;
  const targetCurrency = getCountry(countryCode).currency;
  const converted = convertCurrency(amount, listCurrency, targetCurrency);

  if (listCurrency === targetCurrency || converted === null) {
    return { amount, currency: listCurrency, converted: false };
  }
  return { amount: converted, currency: targetCurrency, converted: true };
}

/** Static FX conversion via the config table (USD base). Presentation only. */
export function convertCurrency(amount, from, to) {
  if (from === to) return amount;
  const fromRate = rateFor(from);
  const toRate = rateFor(to);
  if (fromRate === null || toRate === null) return null;
  return (amount / fromRate) * toRate;
}

function rateFor(currency) {
  switch (currency) {
    case "USD":
      return 1;
    case "NPR":
      return getCountry("NP").usdRate;
    case "BDT":
      return getCountry("BD").usdRate;
    case "CNY":
      return getCountry("CN").usdRate;
    case "INR":
      return getCountry("IN").usdRate;
    default:
      return null;
  }
}
