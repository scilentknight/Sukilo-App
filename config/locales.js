/**
 * Central platform configuration.
 *
 * Everything country/currency/language related lives here so new markets can
 * be added by editing data, never by touching components. Components consume
 * these through the `CountryProvider` context and the pure helpers in
 * `src/lib/format.ts`.
 */

export const COUNTRIES = [
  {
    code: "NP",
    name: "Nepal",
    flag: "🇳🇵",
    currency: "NPR",
    languages: ["en", "ne"],
    defaultLanguage: "ne",
    usdRate: 133.5,
    freeShippingThreshold: 5000,
    deliveryEstimate: "1–3 business days",
  },
  {
    code: "BD",
    name: "Bangladesh",
    flag: "🇧🇩",
    currency: "BDT",
    languages: ["en", "bn"],
    defaultLanguage: "bn",
    usdRate: 110.5,
    freeShippingThreshold: 3000,
    deliveryEstimate: "1–4 business days",
  },
  {
    code: "CN",
    name: "China",
    flag: "🇨🇳",
    currency: "CNY",
    languages: ["en", "zh"],
    defaultLanguage: "zh",
    usdRate: 7.25,
    freeShippingThreshold: 300,
    deliveryEstimate: "2–5 business days",
  },
  {
    code: "IN",
    name: "India",
    flag: "🇮🇳",
    currency: "INR",
    languages: ["en", "hi"],
    defaultLanguage: "en",
    usdRate: 83.3,
    freeShippingThreshold: 2000,
    deliveryEstimate: "1–4 business days",
  },
  {
    code: "US",
    name: "United States",
    flag: "🇺🇸",
    currency: "USD",
    languages: ["en"],
    defaultLanguage: "en",
    usdRate: 1,
    freeShippingThreshold: 50,
    deliveryEstimate: "2–6 business days",
  },
];

export const DEFAULT_COUNTRY_CODE = "NP";

export const CURRENCIES = {
  NPR: { code: "NPR", symbol: "Rs", name: "Nepalese Rupee", decimals: 0 },
  BDT: { code: "BDT", symbol: "৳", name: "Bangladeshi Taka", decimals: 0 },
  CNY: { code: "CNY", symbol: "¥", name: "Chinese Yuan", decimals: 2 },
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee", decimals: 0 },
  USD: { code: "USD", symbol: "$", name: "US Dollar", decimals: 2 },
};

export const LANGUAGES = {
  en: { code: "en", label: "English", englishLabel: "English", dir: "ltr" },
  ne: { code: "ne", label: "नेपाली", englishLabel: "Nepali", dir: "ltr" },
  bn: { code: "bn", label: "বাংলা", englishLabel: "Bangla", dir: "ltr" },
  zh: { code: "zh", label: "中文", englishLabel: "Chinese", dir: "ltr" },
  hi: { code: "hi", label: "हिन्दी", englishLabel: "Hindi", dir: "ltr" },
};

export function getCountry(code) {
  return COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0];
}

export function getCurrency(code) {
  return CURRENCIES[code] ?? CURRENCIES.USD;
}

export function getLanguage(code) {
  return LANGUAGES[code] ?? LANGUAGES.en;
}

export function isSupportedLanguage(code) {
  return code in LANGUAGES;
}

export function isSupportedCountry(code) {
  return COUNTRIES.some((c) => c.code === code);
}
