"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/cn";

export const sum = (values) => values.reduce((total, n) => total + n, 0);

export function tooltipStyle(darkMode) {
  return {
    contentStyle: {
      borderRadius: 8,
      fontSize: 12,
      border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
      background: darkMode ? "#1e293b" : "#ffffff",
      color: darkMode ? "#f1f5f9" : "#0f172a",
    },
    itemStyle: { color: darkMode ? "#e2e8f0" : "#334155" },
  };
}

/** Percentage change against the previous period. */
export function Delta({ now, before }) {
  if (before == null) return <span className="text-ink-400">no earlier data</span>;
  if (before === 0) return <span className="text-ink-400">{now > 0 ? "new activity" : "no change"}</span>;
  const change = ((now - before) / before) * 100;
  return (
    <span className={change >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}>
      {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(1)}%
    </span>
  );
}

export function Panel({ title, aside, children, className }) {
  return (
    <section className={cn("bg-white p-5 dark:bg-ink-900", className)}>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink-900 dark:text-white">{title}</h2>
        {aside ? <div className="text-xs text-ink-500 dark:text-ink-400">{aside}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function Row({ label, value, note }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-ink-100 py-2.5 last:border-0 dark:border-ink-800">
      <div>
        <p className="text-sm text-ink-600 dark:text-ink-300">{label}</p>
        {note ? <p className="text-xs text-ink-400">{note}</p> : null}
      </div>
      <p className="text-sm font-semibold tabular-nums text-ink-900 dark:text-white">{value}</p>
    </div>
  );
}

export function Muted({ children, className }) {
  return <p className={cn("py-10 text-center text-sm text-ink-400", className)}>{children}</p>;
}

/** Donut with a centred total and a legend; `format` renders each value. */
export function Donut({ items, center, format, darkMode }) {
  const total = sum(items.map((item) => item.value));
  if (!total) return <Muted>Nothing to show yet.</Muted>;
  return (
    <div>
      <div className="relative mx-auto h-44 w-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={items} dataKey="value" innerRadius={56} outerRadius={80} paddingAngle={2} stroke="none">
              {items.map((item) => (
                <Cell key={item.name} fill={item.color} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => format(Number(v ?? 0))} {...tooltipStyle(darkMode)} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-semibold tabular-nums text-ink-900 dark:text-white">{format(total)}</span>
          <span className="text-xs text-ink-400">{center}</span>
        </div>
      </div>
      <ul className="mt-3">
        {items.map((item) => (
          <li key={item.name} className="flex items-center gap-2.5 py-1 text-sm">
            <i aria-hidden className="h-2.5 w-2.5 rounded-sm" style={{ background: item.color }} />
            <span className="flex-1 truncate text-ink-600 dark:text-ink-300">{item.name}</span>
            <span className="font-medium tabular-nums text-ink-900 dark:text-white">{format(item.value)}</span>
            <span className="w-11 text-right tabular-nums text-ink-400">
              {((item.value / total) * 100).toFixed(0)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
