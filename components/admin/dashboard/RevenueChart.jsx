"use client";

import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { tooltipStyle } from "./widgets";

/** Daily revenue bars with a 7-day moving average line. */
export function RevenueChart({ data, formatMoney, formatAxis, formatDay, darkMode }) {
  const tick = { fontSize: 11, fill: "#94a3b8" };
  return (
    <ResponsiveContainer width="100%" height={270}>
      <ComposedChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={darkMode ? "#1e293b" : "#eef0f3"} />
        <XAxis
          dataKey="date"
          tickFormatter={(v) => formatDay(v)}
          tick={tick}
          tickLine={false}
          axisLine={false}
          interval={Math.max(0, Math.ceil(data.length / 8) - 1)}
        />
        <YAxis tick={tick} tickLine={false} axisLine={false} width={56} tickFormatter={formatAxis} />
        <Tooltip
          labelFormatter={(v) => formatDay(String(v), true)}
          formatter={(v) => formatMoney(Number(v ?? 0))}
          cursor={{ fill: darkMode ? "#1e293b" : "#f1f5f9" }}
          {...tooltipStyle(darkMode)}
        />
        <Bar dataKey="Revenue" fill={darkMode ? "#3730a3" : "#c7d2fe"} radius={[2, 2, 0, 0]} maxBarSize={18} />
        <Line dataKey="7-day average" type="monotone" stroke="#f97316" strokeWidth={2} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
