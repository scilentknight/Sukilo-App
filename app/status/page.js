"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

export default function SystemStatusPage() {
  const [backendStatus, setBackendStatus] = useState({
    loading: true,
    connected: false,
    data: null,
    error: null,
  });

  const [dbStatus, setDbStatus] = useState({
    loading: true,
    connected: false,
    data: null,
    error: null,
  });

  const [lastChecked, setLastChecked] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function checkHealth() {
      try {
        const backendData = await apiFetch("/api/v1/health");
        if (!ignore) {
          setBackendStatus({
            loading: false,
            connected: backendData?.status === "healthy",
            data: backendData,
            error: null,
          });
        }
      } catch (err) {
        if (!ignore) {
          setBackendStatus({
            loading: false,
            connected: false,
            data: null,
            error: err.message || "Failed to reach backend",
          });
        }
      }

      try {
        const dbData = await apiFetch("/api/v1/database-test");
        if (!ignore) {
          setDbStatus({
            loading: false,
            connected: dbData?.database === "connected",
            data: dbData,
            error: null,
          });
        }
      } catch (err) {
        if (!ignore) {
          setDbStatus({
            loading: false,
            connected: false,
            data: null,
            error: err.message || "Failed to connect to database",
          });
        }
      }

      if (!ignore) {
        setLastChecked(new Date().toLocaleTimeString());
      }
    }

    checkHealth();

    return () => {
      ignore = true;
    };
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    setBackendStatus((prev) => ({ ...prev, loading: true, error: null }));
    setDbStatus((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const backendData = await apiFetch("/api/v1/health");
      setBackendStatus({
        loading: false,
        connected: backendData?.status === "healthy",
        data: backendData,
        error: null,
      });
    } catch (err) {
      setBackendStatus({
        loading: false,
        connected: false,
        data: null,
        error: err.message || "Failed to reach backend",
      });
    }

    try {
      const dbData = await apiFetch("/api/v1/database-test");
      setDbStatus({
        loading: false,
        connected: dbData?.database === "connected",
        data: dbData,
        error: null,
      });
    } catch (err) {
      setDbStatus({
        loading: false,
        connected: false,
        data: null,
        error: err.message || "Failed to connect to database",
      });
    }

    setLastChecked(new Date().toLocaleTimeString());
    setIsRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-zinc-100 flex flex-col items-center justify-center p-6 selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-3xl">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Sukilo System Status
          </h1>
          <p className="mt-3 text-zinc-400 text-base">
            Stack diagnostics at <code className="text-zinc-300">/status</code>
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-2">Backend API</h3>
            <p className="text-sm text-zinc-400">
              {backendStatus.loading
                ? "Checking..."
                : backendStatus.connected
                  ? "Connected"
                  : backendStatus.error || "Disconnected"}
            </p>
          </div>
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-2">Database</h3>
            <p className="text-sm text-zinc-400">
              {dbStatus.loading
                ? "Checking..."
                : dbStatus.connected
                  ? "Connected"
                  : dbStatus.error || "Disconnected"}
            </p>
          </div>
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg disabled:opacity-50"
        >
          {isRefreshing ? "Testing stack..." : "Re-test Connection"}
        </button>
        {lastChecked && (
          <p className="mt-4 text-xs text-zinc-500">Last checked at: {lastChecked}</p>
        )}
      </div>
    </div>
  );
}
