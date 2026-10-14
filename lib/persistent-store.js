import { useSyncExternalStore } from "react";

/**
 * A tiny observable wrapper around a `localStorage` key, designed for React's
 * `useSyncExternalStore`. This is the correct way to read browser-persisted
 * state: it avoids hydration mismatches (the server snapshot is the fallback),
 * syncs across tabs, and — unlike `useState` + `useEffect` hydration — does not
 * trigger cascading renders.
 */

export function createPersistentStore(key, fallback, parse, extraEvents = []) {
  let cache = fallback;
  let rawCache = null;
  const listeners = new Set();

  const readRaw = () => {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  };

  const emit = () => {
    for (const listener of listeners) listener();
  };

  const refresh = () => {
    const raw = readRaw();
    if (raw === rawCache) return;
    rawCache = raw;
    cache = parse(raw);
    emit();
  };

  const onStorage = (event) => {
    if (event.key === key) refresh();
  };

  const subscribe = (listener) => {
    listeners.add(listener);
    if (listeners.size === 1 && typeof window !== "undefined") {
      window.addEventListener("storage", onStorage);
      for (const name of extraEvents) window.addEventListener(name, refresh);
    }
    // Pull the persisted value on first subscription (client only).
    refresh();
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0 && typeof window !== "undefined") {
        window.removeEventListener("storage", onStorage);
        for (const name of extraEvents) window.removeEventListener(name, refresh);
      }
    };
  };

  const get = () => cache;
  const getSnapshot = () => cache;
  const getServerSnapshot = () => fallback;

  const set = (value) => {
    const next = typeof value === "function" ? value(cache) : value;
    cache = next;
    rawCache = JSON.stringify(next);
    try {
      window.localStorage.setItem(key, rawCache);
    } catch {
      /* storage may be unavailable (private mode) */
    }
    emit();
  };

  return { subscribe, getSnapshot, getServerSnapshot, get, set };
}

/** Subscribes to a persistent store and returns its current value. */
export function usePersistentStore(store) {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}

/* -------------------------------------------------------------------------- */
/*                              Parse helpers                                 */
/* -------------------------------------------------------------------------- */

export function parseJsonArray(guard) {
  return (raw) => {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(guard) : [];
    } catch {
      return [];
    }
  };
}

export function parseString(fallback) {
  return (raw) => raw ?? fallback;
}

export function parseNullableString(raw) {
  return raw && raw.length > 0 ? raw : null;
}

export function parseBoolean(raw) {
  return raw === "true";
}
