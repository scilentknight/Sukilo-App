"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Package, Plus } from "lucide-react";
import {
  createStoreProduct,
  listStoreCategories,
  listStoreProducts,
} from "@/lib/admin";
import useAdminQuery from "@/lib/useAdminQuery";
import { resolveAssetUrl } from "@/lib/api/api";
import DataTable from "@/components/admin/DataTable";
import Drawer from "@/components/admin/Drawer";
import {
  Card,
  EmptyState,
  ErrorNote,
  PageHeader,
  Pagination,
} from "@/components/admin/ui";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Alert } from "@/components/ui";
import { formatDate, formatMoney } from "@/lib/format";

const LIMIT = 10;

const EMPTY_FORM = {
  name: "",
  category: "",
  price: "",
  currency: "NPR",
  brand: "",
  gtin: "",
  description: "",
};

export default function AdminStoreProductsPage() {
  const [categories, setCategories] = useState([]);
  const [offset, setOffset] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [notice, setNotice] = useState(null);

  const load = useCallback(
    () => listStoreProducts({ skip: offset, limit: LIMIT }),
    [offset],
  );
  const { data, loading, error, refresh } = useAdminQuery(load);
  const items = Array.isArray(data) ? data : (data?.items ?? []);
  const total = Array.isArray(data)
    ? data.length
    : (data?.total ?? data?.items?.length ?? 0);

  useEffect(() => {
    listStoreCategories()
      .then((result) => setCategories(result?.items ?? []))
      .catch(() => {});
  }, []);

  function openForm() {
    setForm(EMPTY_FORM);
    setImages([]);
    setFormError(null);
    setFormOpen(true);
  }

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleCreate(event) {
    event.preventDefault();
    setFormError(null);
    if (images.length === 0) {
      setFormError("Select at least one product image.");
      return;
    }
    setSaving(true);
    try {
      const body = new FormData();
      body.append("name", form.name);
      body.append("category", form.category);
      body.append("price", form.price);
      body.append("currency", form.currency);
      if (form.brand) body.append("brand", form.brand);
      if (form.gtin) body.append("gtin", form.gtin);
      if (form.description) body.append("description", form.description);
      for (const file of images) body.append("images", file);
      await createStoreProduct(body);
      setNotice(`Product "${form.name}" created.`);
      setFormOpen(false);
      setOffset(0);
      refresh();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    {
      header: "Product",
      cell: (row) => {
        const image =
          row.images?.find((item) => item.is_primary) ?? row.images?.[0];
        const src = image ? resolveAssetUrl(image.image_url) : null;
        return (
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-ink-100">
              {src ? (
                <Image
                  src={src}
                  alt={row.name}
                  fill
                  sizes="40px"
                  className="object-cover"
                  unoptimized={src.startsWith("http")}
                />
              ) : (
                <span className="grid h-full w-full place-items-center text-ink-400">
                  <Package size={17} />
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium text-ink-900">{row.name}</p>
              <p className="truncate text-xs text-ink-500">
                {row.brand || "No brand"}
                {row.gtin ? ` · ${row.gtin}` : ""}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      header: "Category",
      cell: (row) => (
        <span className="text-sm text-ink-700">{row.category}</span>
      ),
    },
    {
      header: "Price",
      cell: (row) => (
        <span className="font-medium text-ink-900">
          {formatMoney(row.price, row.currency)}
        </span>
      ),
    },
    {
      header: "Created",
      cell: (row) => (
        <span className="text-xs text-ink-500">
          {formatDate(row.created_at)}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Storefront products"
        description="Products shown on the public /products page. This is the legacy storefront catalog."
        actions={
          <Button onClick={openForm}>
            <Plus size={16} />
            Add product
          </Button>
        }
      />

      {notice && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

      <Card>
        {error && (
          <div className="p-4">
            <ErrorNote message={error} onRetry={() => refresh(true)} />
          </div>
        )}
        <DataTable
          columns={columns}
          rows={items}
          rowKey={(row) => row.id}
          loading={loading}
          empty={
            <EmptyState
              title="No storefront products"
              description="Add a product to make it visible on the public storefront."
            />
          }
        />
        <Pagination
          total={total}
          limit={LIMIT}
          offset={offset}
          onChange={setOffset}
        />
      </Card>

      <Drawer
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="New storefront product"
        subtitle="Uploaded images are indexed for marketplace search."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {formError && <Alert type="error">{formError}</Alert>}
          <Input
            label="Product name"
            value={form.name}
            onChange={(event) => setField("name", event.target.value)}
            required
          />
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-ink-700">Category</span>
            <select
              value={form.category}
              onChange={(event) => setField("category", event.target.value)}
              required
              className="h-10 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.name} value={category.name}>
                  {category.name} ({category.count})
                </option>
              ))}
              <option value="Other">Other</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Price"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(event) => setField("price", event.target.value)}
              required
            />
            <Input
              label="Currency"
              value={form.currency}
              onChange={(event) => setField("currency", event.target.value)}
              placeholder="NPR"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Brand (optional)"
              value={form.brand}
              onChange={(event) => setField("brand", event.target.value)}
            />
            <Input
              label="GTIN (optional)"
              value={form.gtin}
              onChange={(event) => setField("gtin", event.target.value)}
            />
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-ink-700">
              Description (optional)
            </span>
            <textarea
              value={form.description}
              onChange={(event) => setField("description", event.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              placeholder="Product description…"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-ink-700">Images</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(event) =>
                setImages(Array.from(event.target.files ?? []))
              }
              className="text-sm text-ink-600 file:mr-3 file:rounded-lg file:border-0 file:bg-ink-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-ink-700"
            />
            {images.length > 0 && (
              <span className="text-xs text-ink-500">
                {images.length} file(s) selected
              </span>
            )}
          </label>
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setFormOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Create product
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
