"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { CURRENCIES, getCountry, getCurrency } from "@/config/locales";
import { formatMoney } from "@/lib/format";
import {
  createPersistentStore,
  parseNullableString,
  usePersistentStore,
} from "@/lib/persistent-store";
import { useCountry } from "./CountryContext";

const CurrencyContext = createContext(null);

const STORAGE_KEY = "sukilo.currency";

const currencyStore = createPersistentStore(STORAGE_KEY, null, (raw) =>
  raw && raw in CURRENCIES ? parseNullableString(raw) : null,
);

export function CurrencyProvider({ children }) {
  const { country, countryCode } = useCountry();
  const override = usePersistentStore(currencyStore);
  const currencyCode = override ?? country.currency;

  const setCurrency = useCallback(
    (code) => {
      if (!(code in CURRENCIES)) return;
      // Choosing the country default clears the override.
      currencyStore.set(code === getCountry(countryCode).currency ? null : code);
    },
    [countryCode],
  );

  const value = useMemo(() => {
    const currency = getCurrency(currencyCode);
    return {
      currency,
      currencyCode,
      currencies: Object.values(CURRENCIES),
      isOverridden: override !== null,
      setCurrency,
      format: (amount, code) =>
        formatMoney(amount, { currency: code ?? currencyCode, language: country.defaultLanguage }),
      formatCompact: (amount, code) =>
        formatMoney(amount, {
          currency: code ?? currencyCode,
          language: country.defaultLanguage,
          compact: true,
        }),
    };
  }, [currencyCode, override, setCurrency, country.defaultLanguage]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within a CurrencyProvider");
  return ctx;
}
