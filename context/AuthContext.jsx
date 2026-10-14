"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { hasStoredSession, isSignedIn, refreshSession, subscribe } from "@/lib/auth";

const AuthContext = createContext(null);

/**
 * Exposes `status`: "loading" until we know whether a previous session can be
 * restored (one refresh call on load), then "authenticated" or "anonymous".
 * Tokens themselves stay inside `lib/auth`.
 */
export function AuthProvider({ children }) {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const sync = () => setStatus(isSignedIn() ? "authenticated" : "anonymous");
    const unsubscribe = subscribe(sync);
    if (isSignedIn() || !hasStoredSession()) sync();
    else refreshSession().finally(sync);
    return unsubscribe;
  }, []);

  const value = useMemo(() => ({ status, isAuthenticated: status === "authenticated" }), [status]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
