"use client";

import { Skeleton } from "@/components/ui";

/**
 * Simple table renderer shared by every admin list.
 *
 * columns: [{ header, cell: (row) => ReactNode, className? }]
 */
export default function DataTable({
  columns,
  rows,
  rowKey,
  loading = false,
  skeletonRows = 6,
  empty,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-ink-200 bg-ink-50/70">
            {columns.map((column) => (
              <th
                key={column.header}
                scope="col"
                className={`px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-ink-500 ${
                  column.headerClassName ?? ""
                }`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {loading &&
            Array.from({ length: skeletonRows }).map((_, rowIndex) => (
              <tr key={`skeleton-${rowIndex}`}>
                {columns.map((column) => (
                  <td key={column.header} className="px-4 py-3.5">
                    <Skeleton className="h-4 w-3/4" />
                  </td>
                ))}
              </tr>
            ))}

          {!loading &&
            rows.map((row) => (
              <tr key={rowKey(row)} className="hover:bg-ink-50/60">
                {columns.map((column) => (
                  <td
                    key={column.header}
                    className={`px-4 py-3.5 align-middle text-ink-700 ${column.className ?? ""}`}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}

          {!loading && rows.length === 0 && (
            <tr>
              <td colSpan={columns.length}>{empty}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
