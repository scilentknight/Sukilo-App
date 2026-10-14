"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { COUNTRIES, DEFAULT_COUNTRY_CODE, getCountry, isSupportedCountry } from "@/config/locales";
import {
  createPersistentStore,
  parseNullableString,
  usePersistentStore,
} from "@/lib/persistent-store";

const CountryContext = createContext(null);

const STORAGE_KEY = "sukilo.country";

/** Persisted country selection; validated against the supported list. */
const countryStore = createPersistentStore(STORAGE_KEY, null, (raw) =>
  raw && isSupportedCountry(raw) ? parseNullableString(raw) : null,
);

export function CountryProvider({ children, initialCountry = DEFAULT_COUNTRY_CODE }) {
  const stored = usePersistentStore(countryStore);
  const countryCode = stored ?? initialCountry;
  const country = useMemo(() => getCountry(countryCode), [countryCode]);

  const setCountry = useCallback((code) => {
    if (!isSupportedCountry(code)) return;
    countryStore.set(code);
    try {
      document.cookie = `${STORAGE_KEY}=${code}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      /* ignore cookie failures */
    }
  }, []);

  const value = useMemo(
    () => ({
      country,
      countryCode,
      currencyCode: country.currency,
      setCountry,
      countries: COUNTRIES,
      ready: stored !== null,
    }),
    [country, countryCode, setCountry, stored],
  );

  return <CountryContext.Provider value={value}>{children}</CountryContext.Provider>;
}

export function useCountry() {
  const ctx = useContext(CountryContext);
  if (!ctx) throw new Error("useCountry must be used within a CountryProvider");
  return ctx;
}
