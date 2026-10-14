"use client";

import { useCallback, useEffect, useState } from "react";
import { getApiHealth, getDatabaseHealth, getVectorHealth } from "@/lib/system";

const PENDING = { loading: true, connected: false, error: null };

async function probe(check, isConnected) {
  try {
    return { loading: false, connected: isConnected(await check()), error: null };
  } catch (err) {
    return { loading: false, connected: false, error: err.message || "Unavailable" };
  }
}

function checkStack() {
  return Promise.all([
    probe(getApiHealth, (data) => data?.status === "healthy"),
    probe(getDatabaseHealth, (data) => data?.database === "connected"),
    probe(getVectorHealth, (data) => data?.qdrant === "connected"),
  ]);
}

export default function SystemStatusPage() {
  const [backendStatus, setBackendStatus] = useState(PENDING);
  const [dbStatus, setDbStatus] = useState(PENDING);
  const [vectorStatus, setVectorStatus] = useState(PENDING);
  const [lastChecked, setLastChecked] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const apply = useCallback(([backend, database, vectors]) => {
    setBackendStatus(backend);
    setDbStatus(database);
    setVectorStatus(vectors);
    setLastChecked(new Date().toLocaleTimeString());
  }, []);

  useEffect(() => {
    let ignore = false;
    checkStack().then((result) => !ignore && apply(result));
    return () => {
      ignore = true;
    };
  }, [apply]);

  const handleManualRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setBackendStatus(PENDING);
    setDbStatus(PENDING);
    setVectorStatus(PENDING);
    apply(await checkStack());
    setIsRefreshing(false);
  };

  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-zinc-100 flex flex-col items-center justify-center p-6 selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-3xl">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Sukilo System Status
          </h1>
          <p className="mt-3 text-zinc-400 text-base">
            Stack diagnostics at <code className="text-zinc-300">/status</code>
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatusCard title="Backend API" status={backendStatus} />
          <StatusCard title="Database" status={dbStatus} />
          <StatusCard title="Visual search" status={vectorStatus} />
        </div>

        <button
          type="button"
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

function StatusCard({ title, status }) {
  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-zinc-400" role="status">
        {status.loading
          ? "Checking..."
          : status.connected
            ? "Connected"
            : status.error || "Disconnected"}
      </p>
    </div>
  );
}
