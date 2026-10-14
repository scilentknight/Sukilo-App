"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, RefreshCw } from "lucide-react";
import { COUNTRIES, DEFAULT_COUNTRY_CODE } from "@/config/locales";
import { getAdminDashboard } from "@/lib/admin";
import { cn } from "@/lib/cn";
import { formatDate, formatMoney, formatNumber, toNumber } from "@/lib/format";
import { usePersistentStore } from "@/lib/persistent-store";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/States";
import { adminThemeStore } from "../theme";
import { RevenueChart } from "./RevenueChart";
import { Delta, Donut, Muted, Panel, Row, sum } from "./widgets";

const LANGUAGE = "en";
const RANGES = [7, 30, 90];
const POLL_MS = 60_000;
const STATUSES = [
  { key: "PENDING", label: "Pending", color: "#94a3b8" },
  { key: "PROCESSING", label: "Processing", color: "#2563eb" },
  { key: "SHIPPED", label: "Shipped", color: "#f97316" },
  { key: "DELIVERED", label: "Delivered", color: "#10b981" },
  { key: "RETURNED", label: "Returned", color: "#f59e0b" },
  { key: "CANCELLED", label: "Cancelled", color: "#e11d48" },
];
const PALETTE = ["#4f46e5", "#f97316", "#10b981", "#f59e0b", "#8b5cf6", "#94a3b8"];

/** API days are "YYYY-MM-DD"; parse them as local dates so they don't shift a day west of UTC. */
const parseDay = (value) => new Date(`${value}T00:00:00`);
const formatDay = (value, long = false) =>
  formatDate(
    parseDay(value),
    LANGUAGE,
    long ? { weekday: "short", month: "short", day: "numeric" } : { month: "short", day: "numeric" },
  );

function timeAgo(value, now) {
  const minutes = Math.max(0, Math.round((now - new Date(value).getTime()) / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h ago`;
  return formatDate(value, LANGUAGE, { month: "short", day: "numeric" });
}

function summarize(data, range, statusFilter, search) {
  const days = data.revenue_by_day.map((d) => ({
    date: d.date,
    revenue: toNumber(d.revenue) ?? 0,
    orders: d.orders ?? null,
  }));
  const hasOrders = days.some((d) => d.orders != null);
  const period = (n) => {
    const current = days.slice(-n);
    const previous = days.length >= n * 2 ? days.slice(-n * 2, -n) : null;
    return {
      revenue: sum(current.map((d) => d.revenue)),
      orders: hasOrders ? sum(current.map((d) => d.orders ?? 0)) : null,
      prevRevenue: previous ? sum(previous.map((d) => d.revenue)) : null,
    };
  };

  const inRange = days.slice(-range);
  const chart = inRange.map((d, i) => {
    const week = inRange.slice(Math.max(0, i - 6), i + 1);
    return { date: d.date, Revenue: d.revenue, "7-day average": sum(week.map((x) => x.revenue)) / week.length };
  });
  const best = inRange.reduce((top, d) => (d.revenue > top.revenue ? d : top), inRange[0] ?? { date: "", revenue: 0 });
  const byStatus = new Map(data.orders_by_status.map((s) => [s.status, s.count]));
  const query = search.trim().toLowerCase();
  const orders = (data.recent_orders ?? []).filter(
    (o) =>
      (statusFilter === "ALL" || o.status === statusFilter) &&
      (!query ||
        o.customer.toLowerCase().includes(query) ||
        o.id.toLowerCase().includes(query) ||
        o.vendor?.toLowerCase().includes(query)),
  );

  return {
    periods: [
      { label: "Today", vs: "vs yesterday", ...period(1) },
      { label: "This week", vs: "vs last week", ...period(7) },
      { label: "This month", vs: "vs last month", ...period(30) },
    ],
    chart,
    best,
    byStatus,
    statusTotal: sum(STATUSES.map((s) => byStatus.get(s.key) ?? 0)),
    topMax: Math.max(1, ...data.top_products.map((p) => p.quantity)),
    orders,
    rangeRevenue: sum(inRange.map((d) => d.revenue)),
    days: inRange.length,
  };
}

export function AdminDashboard() {
  const darkMode = usePersistentStore(adminThemeStore) === "dark";
  const [query, setQuery] = useState({ range: 30, countryCode: DEFAULT_COUNTRY_CODE });
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState({ state: "loading", data: null, error: null, updatedAt: null, pending: false });
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [toasts, setToasts] = useState([]);
  const [unread, setUnread] = useState(0);
  const seen = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const announce = (orders = []) => {
      if (seen.current) {
        const fresh = orders.filter((o) => !seen.current.has(o.id));
        if (fresh.length) {
          setToasts((list) => [...fresh.slice(0, 3), ...list].slice(0, 4));
          setUnread((n) => n + fresh.length);
          setTimeout(() => setToasts((list) => list.filter((o) => !fresh.includes(o))), 9000);
        }
      }
      seen.current = new Set([...(seen.current ?? []), ...orders.map((o) => o.id)]);
    };

    const load = () =>
      getAdminDashboard(query).then(
        (data) => {
          if (cancelled) return;
          announce(data.recent_orders);
          setResult({ state: "ready", data, error: null, updatedAt: new Date(), pending: false });
        },
        (error) => {
          if (cancelled) return;
          setResult((prev) =>
            prev.data
              ? { ...prev, pending: false, error: error.message }
              : { state: "error", data: null, error: error.message, updatedAt: null, pending: false },
          );
        },
      );

    load();
    const poll = setInterval(() => document.visibilityState === "visible" && load(), POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(poll);
    };
  }, [query, reloadKey]);

  const refresh = () => {
    setResult((prev) => ({ ...prev, pending: true }));
    setReloadKey((k) => k + 1);
  };

  const changeQuery = (patch) => {
    if (patch.countryCode) seen.current = null;
    setResult((prev) => ({ ...prev, pending: true }));
    setQuery((prev) => ({ ...prev, ...patch }));
  };

  const data = result.data;
  const m = useMemo(
    () => (data ? summarize(data, query.range, statusFilter, search) : null),
    [data, query.range, statusFilter, search],
  );

  if (result.state === "loading") return <DashboardSkeleton />;
  if (result.state === "error" || !data || !m) {
    return <ErrorState title="Couldn't load the dashboard" message={result.error} onRetry={refresh} />;
  }

  const money = (value) => formatMoney(value, { currency: data.currency, language: LANGUAGE });
  const axisMoney = (value) => formatMoney(value, { currency: data.currency, language: LANGUAGE, compact: true });
  const count = (value) => formatNumber(value, LANGUAGE);
  const totals = data.totals;
  const totalRevenue = toNumber(totals.revenue) ?? 0;
  const averageOrder = totals.orders ? totalRevenue / totals.orders : 0;
  const toProcess = (m.byStatus.get("PENDING") ?? 0) + (m.byStatus.get("PROCESSING") ?? 0);
  const now = result.updatedAt?.getTime() ?? 0;
  const attention = [
    data.low_stock ? `${data.low_stock.length} products low on stock` : null,
    data.pending_vendor_applications ? `${data.pending_vendor_applications} vendor applications` : null,
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900 dark:text-white">Marketplace overview</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-ink-500 dark:text-ink-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {result.updatedAt
              ? `Updated ${result.updatedAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
              : "Live"}
            {result.error ? <span className="text-rose-600 dark:text-rose-400">· Couldn&apos;t refresh</span> : null}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="dashboard-market">
            Market
          </label>
          <select
            id="dashboard-market"
            value={query.countryCode}
            onChange={(e) => changeQuery({ countryCode: e.target.value })}
            className="focus-ring h-8 rounded-md border border-ink-200 bg-white px-2 text-xs text-ink-700 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-200"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name} ({c.currency})
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={refresh}
            disabled={result.pending}
            aria-label="Refresh"
            className="focus-ring rounded-md p-2 text-ink-500 hover:bg-ink-200/70 disabled:opacity-60 dark:text-ink-400 dark:hover:bg-ink-800"
          >
            <RefreshCw className={cn("h-4 w-4", result.pending && "animate-spin")} />
          </button>
          <button
            type="button"
            onClick={() => setUnread(0)}
            aria-label={`${unread} new orders`}
            className="focus-ring relative rounded-md p-2 text-ink-500 hover:bg-ink-200/70 dark:text-ink-400 dark:hover:bg-ink-800"
          >
            <Bell className="h-4 w-4" />
            {unread > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-orange-500 px-1 text-center text-[10px] font-semibold leading-4 text-white">
                {unread}
              </span>
            ) : null}
          </button>
          <div className="inline-flex rounded-md bg-ink-200/70 p-0.5 dark:bg-ink-800" role="group" aria-label="Date range">
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => changeQuery({ range: r })}
                aria-pressed={query.range === r}
                className={cn(
                  "rounded px-3 py-1 text-xs font-medium",
                  query.range === r
                    ? "bg-white text-ink-900 shadow-sm dark:bg-ink-700 dark:text-white"
                    : "text-ink-600 hover:text-ink-900 dark:text-ink-400 dark:hover:text-white",
                )}
              >
                {r} days
              </button>
            ))}
          </div>
        </div>
      </div>

      {data.sample ? (
        <p
          role="note"
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
        >
          Sample data. The dashboard isn&apos;t connected to the API yet, so these figures are generated for layout
          only.
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-ink-200 bg-ink-200 sm:grid-cols-2 lg:grid-cols-12 dark:border-ink-800 dark:bg-ink-800">
        {m.periods.map((p) => (
          <Panel key={p.label} title={p.label} className="lg:col-span-3" aside={<Delta now={p.revenue} before={p.prevRevenue} />}>
            <p className="text-3xl font-semibold tabular-nums tracking-tight text-ink-900 dark:text-white">
              {money(p.revenue)}
            </p>
            <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
              {p.orders != null ? `${count(p.orders)} orders` : "sales"}
              <span className="text-ink-400"> · {p.vs}</span>
            </p>
          </Panel>
        ))}
        <Panel title="Needs attention" className="lg:col-span-3">
          <p className="text-3xl font-semibold tabular-nums tracking-tight text-ink-900 dark:text-white">{count(toProcess)}</p>
          <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
            orders to process{attention.length ? `, ${attention.join(", ")}` : ""}
          </p>
        </Panel>

        <Panel
          className="sm:col-span-2 lg:col-span-8"
          title={`Revenue, last ${query.range} days`}
          aside={`${money(m.rangeRevenue)} total`}
        >
          {m.rangeRevenue === 0 ? (
            <Muted className="flex h-64 items-center justify-center py-0">No revenue in this period yet.</Muted>
          ) : (
            <RevenueChart data={m.chart} formatMoney={money} formatAxis={axisMoney} formatDay={formatDay} darkMode={darkMode} />
          )}
        </Panel>

        <Panel className="sm:col-span-2 lg:col-span-4" title="At a glance" aside="all time">
          <Row label="Revenue" value={money(totalRevenue)} />
          <Row label="Orders" value={count(totals.orders)} note={`${money(averageOrder)} average order`} />
          <Row
            label="Customers"
            value={count(totals.customers)}
            note={`${totals.customers ? (totals.orders / totals.customers).toFixed(1) : 0} orders each`}
          />
          <Row label="Active vendors" value={count(totals.vendors)} />
          <Row label="Published products" value={count(totals.products)} />
          <Row
            label="Best day in range"
            value={money(m.best.revenue)}
            note={m.best.date ? formatDay(m.best.date, true) : undefined}
          />
          <Row label="Daily average" value={money(m.rangeRevenue / Math.max(1, m.days))} />
        </Panel>

        <Panel className="lg:col-span-4" title="Orders by status" aside={`${count(m.statusTotal)} orders`}>
          <Donut
            center="orders"
            format={count}
            darkMode={darkMode}
            items={STATUSES.map((s) => ({ name: s.label, value: m.byStatus.get(s.key) ?? 0, color: s.color }))}
          />
        </Panel>

        <Panel className="lg:col-span-4" title="Best sellers" aside="units sold">
          {data.top_products.length === 0 ? (
            <Muted>No sales yet.</Muted>
          ) : (
            <ol>
              {data.top_products.map((p, i) => (
                <li
                  key={p.name}
                  className="grid grid-cols-[1.25rem_1fr_auto] items-center gap-x-3 border-b border-ink-100 py-2 last:border-0 dark:border-ink-800"
                >
                  <span className="text-xs tabular-nums text-ink-400">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm text-ink-800 dark:text-ink-200">{p.name}</p>
                    <div className="mt-1.5 h-1 rounded-full bg-ink-100 dark:bg-ink-800">
                      <div className="h-1 rounded-full bg-orange-500" style={{ width: `${(p.quantity / m.topMax) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-ink-900 dark:text-white">{count(p.quantity)}</span>
                </li>
              ))}
            </ol>
          )}
        </Panel>

        {data.revenue_by_category?.length ? (
          <Panel className="lg:col-span-4" title="Revenue by category">
            <Donut
              center="revenue"
              format={axisMoney}
              darkMode={darkMode}
              items={data.revenue_by_category.map((c, i) => ({
                name: c.name,
                value: toNumber(c.revenue) ?? 0,
                color: PALETTE[i % PALETTE.length],
              }))}
            />
          </Panel>
        ) : data.low_stock?.length ? (
          <Panel className="lg:col-span-4" title="Running low" aside="units left">
            {data.low_stock.map((p) => (
              <Row key={p.name} label={p.name} value={count(p.stock)} />
            ))}
          </Panel>
        ) : (
          <div className="hidden bg-white lg:col-span-4 lg:block dark:bg-ink-900" />
        )}

        {data.recent_orders ? (
          <Panel className="sm:col-span-2 lg:col-span-12" title="Recent orders" aside={`${m.orders.length} shown`}>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {[{ key: "ALL", label: "All" }, ...STATUSES].map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setStatusFilter(s.key)}
                  aria-pressed={statusFilter === s.key}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium",
                    statusFilter === s.key
                      ? "bg-ink-900 text-white dark:bg-white dark:text-ink-900"
                      : "bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-300 dark:hover:bg-ink-700",
                  )}
                >
                  {s.label}
                </button>
              ))}
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search order, customer or vendor"
                aria-label="Search recent orders"
                className="ml-auto w-full rounded-md border border-ink-200 bg-white px-3 py-1.5 text-xs text-ink-800 outline-none focus:border-brand-600 sm:w-64 dark:border-ink-700 dark:bg-slate-950 dark:text-ink-200"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="text-xs text-ink-400">
                  <tr>
                    <th className="pb-2 font-medium">Order</th>
                    <th className="pb-2 font-medium">Customer</th>
                    <th className="pb-2 font-medium">Vendor</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 text-right font-medium">Total</th>
                    <th className="pb-2 text-right font-medium">Placed</th>
                  </tr>
                </thead>
                <tbody>
                  {m.orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-ink-400">
                        No orders match these filters.
                      </td>
                    </tr>
                  ) : null}
                  {m.orders.map((o) => {
                    const status = STATUSES.find((s) => s.key === o.status);
                    return (
                      <tr key={o.id} className="border-t border-ink-100 dark:border-ink-800">
                        <td className="py-2 tabular-nums text-ink-500 dark:text-ink-400">#{o.id.slice(-6)}</td>
                        <td className="py-2 text-ink-800 dark:text-ink-200">{o.customer}</td>
                        <td className="py-2 text-ink-600 dark:text-ink-300">{o.vendor ?? "—"}</td>
                        <td className="py-2">
                          <span className="inline-flex items-center gap-1.5 text-ink-600 dark:text-ink-300">
                            <i aria-hidden className="h-2 w-2 rounded-full" style={{ background: status?.color }} />
                            {status?.label ?? o.status}
                          </span>
                        </td>
                        <td className="py-2 text-right font-medium tabular-nums text-ink-900 dark:text-white">
                          {money(o.total)}
                        </td>
                        <td className="py-2 text-right tabular-nums text-ink-400">{timeAgo(o.created_at, now)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>
        ) : null}
      </div>

      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-72 flex-col gap-2" aria-live="polite">
        {toasts.map((o) => (
          <div
            key={o.id}
            className="pointer-events-auto rounded-md border-l-4 border-orange-500 bg-ink-900 px-4 py-3 text-sm text-white shadow-lg"
          >
            <p className="font-medium">New order, {money(o.total)}</p>
            <p className="text-xs text-ink-300">
              {o.customer} · #{o.id.slice(-6)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading dashboard">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-80 w-full lg:col-span-2" />
        <Skeleton className="h-80 w-full" />
      </div>
    </div>
  );
}
