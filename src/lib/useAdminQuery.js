"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Load one read-only admin query.
 *
 * The loader must only fetch data; state updates happen here after the promise
 * settles. Call `refresh()` after a write action to load fresh data.
 */
export default function useAdminQuery(load) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    load()
      .then((result) => {
        if (!active) return;
        setData(result);
        setError(null);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [load, version]);

  const refresh = useCallback((showLoading = false) => {
    if (showLoading) setLoading(true);
    setVersion((current) => current + 1);
  }, []);

  return { data, loading, error, refresh };
}
