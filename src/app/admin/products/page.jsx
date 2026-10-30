"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { listProducts, listCategories, createProduct, deleteProduct } from "@/lib/products";
import { resolveAssetUrl } from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Alert, Skeleton, EmptyState } from "@/components/ui";

const LIMIT = 10;

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    currency: "NPR",
    description: "",
    brand: "",
    gtin: "",
  });
  const [images, setImages] = useState([]);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    listProducts({ skip: (page - 1) * LIMIT, limit: LIMIT })
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
  }, [page, reloadKey]);
  useEffect(() => {
    listCategories()
      .then((d) => setCategories(d?.items ?? []))
      .catch(() => {});
  }, []);

  function setField(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    setCreateSuccess(false);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("category", form.category);
      fd.append("price", form.price);
      fd.append("currency", form.currency);
      if (form.description) fd.append("description", form.description);
      if (form.brand) fd.append("brand", form.brand);
      if (form.gtin) fd.append("gtin", form.gtin);
      for (const file of images) fd.append("images", file);
      await createProduct(fd);
      setCreateSuccess(true);
      setForm({ name: "", category: "", price: "", currency: "NPR", description: "", brand: "", gtin: "" });
      setImages([]);
      setShowForm(false);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct(id);
      setReloadKey((k) => k + 1);
    } catch (err) {
      alert(`Failed to delete: ${err.message}`);
    }
  }

  const totalPages = Math.ceil(total / LIMIT) || 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Products</h2>
          <p className="text-sm text-ink-400 mt-0.5">{total} products total</p>
        </div>
        <Button onClick={() => { setShowForm((s) => !s); setCreateError(null); setCreateSuccess(false); }} variant="primary" size="md">
          {showForm ? "Cancel" : "+ Add Product"}
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-ink-800 border border-ink-700 rounded-xl p-6 mb-6">
          <h3 className="text-base font-semibold text-white mb-4">New Product</h3>
          {createError && <Alert type="error" className="mb-4">{createError}</Alert>}
          {createSuccess && <Alert type="success" className="mb-4">Product created!</Alert>}
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Product Name" value={form.name} onChange={(e) => setField("name", e.target.value)} required />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-ink-300">Category</label>
              <select
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
                className="rounded-lg border border-ink-600 px-3 py-2 text-sm bg-ink-700 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
                <option value="Other">Other</option>
              </select>
            </div>
            <Input label="Price" type="number" step="0.01" min="0" value={form.price} onChange={(e) => setField("price", e.target.value)} required />
            <Input label="Currency" value={form.currency} onChange={(e) => setField("currency", e.target.value)} placeholder="NPR" required />
            <Input label="Brand (optional)" value={form.brand} onChange={(e) => setField("brand", e.target.value)} />
            <Input label="GTIN (optional)" value={form.gtin} onChange={(e) => setField("gtin", e.target.value)} />
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-ink-300 block mb-1">Description (optional)</label>
              <textarea
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-ink-600 px-3 py-2 text-sm bg-ink-700 text-white placeholder:text-ink-500 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                placeholder="Product description…"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-ink-300 block mb-1">Images</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setImages(Array.from(e.target.files))}
                className="text-sm text-ink-300"
              />
              {images.length > 0 && (
                <p className="text-xs text-ink-400 mt-1">{images.length} file(s) selected</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" loading={creating} className="w-full" size="lg">
                Create Product
              </Button>
            </div>
          </form>
        </div>
      )}

      {error && <Alert type="error" className="mb-4">{error}</Alert>}

      {/* Products table */}
      {loading ? (
        <div className="bg-ink-800 rounded-xl border border-ink-700 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-ink-700">
              <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-4 w-40 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState title="No products yet" description="Add your first product above." />
      ) : (
        <div className="bg-ink-800 rounded-xl border border-ink-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-700">
                <th className="text-left px-4 py-3 text-ink-400 font-medium">Product</th>
                <th className="text-left px-4 py-3 text-ink-400 font-medium hidden sm:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-ink-400 font-medium hidden md:table-cell">Price</th>
                <th className="text-right px-4 py-3 text-ink-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-700">
              {products.map((p) => {
                const img = p.images?.find((i) => i.is_primary) ?? p.images?.[0];
                const src = img ? resolveAssetUrl(img.image_url) : null;
                return (
                  <tr key={p.id} className="hover:bg-ink-750 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-ink-700 flex-shrink-0">
                          {src ? (
                            <Image src={src} alt={p.name} fill className="object-cover" unoptimized={src.startsWith("http")} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-ink-500">📦</div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white line-clamp-1">{p.name}</p>
                          {p.brand && <p className="text-xs text-ink-400">{p.brand}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-300 hidden sm:table-cell">{p.category}</td>
                    <td className="px-4 py-3 text-ink-200 hidden md:table-cell font-medium">
                      {p.currency} {parseFloat(p.price || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="text-rose-400 hover:text-rose-300 text-xs font-medium px-2 py-1 rounded hover:bg-rose-900/30 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 text-sm rounded-lg border border-ink-600 text-ink-300 hover:bg-ink-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Prev
          </button>
          <span className="text-sm text-ink-400">
            Page {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 text-sm rounded-lg border border-ink-600 text-ink-300 hover:bg-ink-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

