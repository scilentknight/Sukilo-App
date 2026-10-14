import { CURRENCIES } from "@/config/locales";

/**
 * Currency-aware formatting. We never string-replace symbols: `Intl.NumberFormat`
 * handles grouping, decimals and symbol placement using the market locale.
 */

const LOCALE_BY_LANGUAGE = {
  en: "en-US",
  ne: "ne-NP",
  bn: "bn-BD",
  zh: "zh-CN",
  hi: "hi-IN",
};

export function localeForLanguage(language) {
  return LOCALE_BY_LANGUAGE[language] ?? "en-US";
}

/** Parses an API numeric string (or number) into a number, tolerating nulls. */
export function toNumber(value) {
  if (value === null || value === undefined) return null;
  const n = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * Formats a monetary amount. `amount` may be the API's decimal string. Codes
 * outside the configured table are still shown in their own currency.
 */
export function formatMoney(amount, options) {
  const value = toNumber(amount);
  if (value === null) return "";

  const { currency, language = "en", locale, compact } = options;
  const decimals = CURRENCIES[currency]?.decimals ?? 2;
  try {
    return new Intl.NumberFormat(locale ?? localeForLanguage(language), {
      style: "currency",
      currency,
      currencyDisplay: compact ? "narrowSymbol" : "symbol",
      maximumFractionDigits: decimals,
      notation: compact ? "compact" : "standard",
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(decimals)}`;
  }
}

/** Formats a plain number (counts) using the market locale. */
export function formatNumber(value, language = "en", options = {}) {
  return new Intl.NumberFormat(localeForLanguage(language), options).format(value);
}

export function formatDate(
  input,
  language = "en",
  options = { year: "numeric", month: "short", day: "numeric" },
) {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(localeForLanguage(language), options).format(date);
}

/** Cosine similarity (0–1) from image search as a match percentage label. */
export function formatVisualMatch(similarity) {
  const percent = Math.round(Math.max(0, Math.min(1, similarity)) * 100);
  return `${percent}% visual match`;
}
