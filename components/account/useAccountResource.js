"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { loginHref } from "./AccountShell";

/**
 * Loads signed-in data once the session is known. `load` must be stable
 * (module-level or `useCallback`). A 401 means the session ended, so the user
 * is sent to log in again.
 */
export function useAccountResource(load) {
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useAuth();
  const [resource, setResource] = useState({ state: "loading", data: null, error: null });

  const settle = useCallback(
    (promise, isCancelled = () => false) =>
      promise
        .then((data) => !isCancelled() && setResource({ state: "ready", data, error: null }))
        .catch((error) => {
          if (isCancelled()) return;
          if (error.status === 401) router.replace(loginHref(pathname));
          else setResource({ state: "error", data: null, error: error.message, errorStatus: error.status });
        }),
    [router, pathname],
  );

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    settle(load(), () => cancelled);
    return () => {
      cancelled = true;
    };
  }, [status, load, settle]);

  const reload = useCallback(() => {
    setResource((prev) => ({ ...prev, state: "loading" }));
    return settle(load());
  }, [load, settle]);

  const setData = useCallback(
    (update) =>
      setResource((prev) => ({
        ...prev,
        data: typeof update === "function" ? update(prev.data) : update,
      })),
    [],
  );

  return { ...resource, reload, setData };
}
