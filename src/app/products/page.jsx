"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProductGrid from "@/components/products/ProductGrid";
import { listProducts, listCategories } from "@/lib/products";
import { Alert, EmptyState } from "@/components/ui";
import { Suspense } from "react";

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = searchParams.get("category") || "";
  const q = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const LIMIT = 12;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const skip = (page - 1) * LIMIT;
    listProducts({ skip, limit: LIMIT, category: category || undefined, q: q || undefined })
      .then((data) => {
        if (!active) return;
        if (Array.isArray(data)) {
          setProducts(data);
          setTotal(data.length);
        } else {
          setProducts(data?.items ?? []);
          setTotal(data?.total ?? data?.items?.length ?? 0);
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [category, q, page]);

  useEffect(() => {
    listCategories()
      .then((data) => setCategories(data?.items ?? []))
      .catch(() => {});
  }, []);

  function navigate(params) {
    const current = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(params)) {
      if (v) current.set(k, v);
      else current.delete(k);
    }
    router.push(`/products?${current.toString()}`);
  }

  const totalPages = Math.ceil(total / LIMIT) || 1;

  return (
    <div className="container-page py-8">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ink-800">
            {q ? `Results for "${q}"` : category || "All Products"}
          </h1>
          {!loading && (
            <p className="text-sm text-ink-500 mt-1">
              {total > 0 ? `${total} product${total !== 1 ? "s" : ""}` : "No products found"}
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <select
            value={category}
            onChange={(e) => navigate({ category: e.target.value, page: "1" })}
            className="rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-700 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.name} value={c.name}>{c.name} ({c.count})</option>
            ))}
          </select>
          {(category || q) && (
            <button
              onClick={() => navigate({ category: "", q: "", page: "1" })}
              className="px-3 py-2 text-sm rounded-lg border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {error && <Alert type="error" className="mb-6">{error}</Alert>}

      {!loading && products.length === 0 && !error ? (
        <EmptyState
          title="No products found"
          description="Try changing your filters or search terms."
          action={
            <Link href="/products" className="px-5 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors">
              View all products
            </Link>
          }
        />
      ) : (
        <ProductGrid products={products} isLoading={loading} columns={4} />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => navigate({ page: String(page - 1) })}
            className="px-4 py-2 text-sm rounded-lg border border-ink-200 hover:bg-ink-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          <span className="text-sm text-ink-500">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => navigate({ page: String(page + 1) })}
            className="px-4 py-2 text-sm rounded-lg border border-ink-200 hover:bg-ink-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container-page py-16 text-center text-ink-500">Loading products…</div>}>
      <ProductsContent />
    </Suspense>
  );
}

