"use client";

import { useState } from "react";
import { ProductToolbar } from "./ProductToolbar";
import { ProductResultsGrid, ProductResultsList } from "@/components/products/ProductResults";
import { Pagination } from "./Pagination";

/**
 * Client shell that owns the grid/list view toggle and composes the toolbar,
 * results and pagination. Product data itself is fetched on the server and
 * passed down, so switching views never refetches.
 */
export function ResultsView({ products, total, limit, parsed, categories }) {
  const [view, setView] = useState("grid");

  return (
    <div className="space-y-4">
      <ProductToolbar
        total={total}
        parsed={parsed}
        categories={categories}
        view={view}
        onViewChange={setView}
      />

      {view === "grid" ? (
        <ProductResultsGrid products={products} />
      ) : (
        <ProductResultsList products={products} />
      )}

      <div className="pt-2">
        <Pagination page={parsed.page} total={total} limit={limit} />
      </div>
    </div>
  );
}
