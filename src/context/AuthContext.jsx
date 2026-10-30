"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  isSignedIn,
  subscribe,
  logout as authLogout,
  refreshSession,
} from "@/lib/auth";
import { getProfile, getRoles } from "@/lib/account";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserData = useCallback(async () => {
    if (!isSignedIn()) {
      setUser(null);
      setRoles([]);
      setIsLoading(false);
      return;
    }
    try {
      const [profile, rolesData] = await Promise.all([
        getProfile(),
        getRoles(),
      ]);
      setUser(profile);
      setRoles(rolesData?.roles ?? []);
    } catch {
      setUser(null);
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // On mount: try to restore session from HttpOnly refresh cookie
  useEffect(() => {
    let cancelled = false;
    refreshSession().then(() => {
      if (!cancelled) loadUserData();
    });
    return () => { cancelled = true; };
  }, [loadUserData]);

  // React to sign-in / sign-out events from auth module
  useEffect(() => {
    return subscribe(() => {
      loadUserData();
    });
  }, [loadUserData]);

  const signOut = useCallback(async () => {
    await authLogout();
    setUser(null);
    setRoles([]);
  }, []);

  const isAdmin = roles.includes("SUPER_ADMIN");

  return (
    <AuthContext.Provider value={{ user, roles, isLoading, signOut, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

