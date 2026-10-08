"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listProducts } from "@/lib/api";
import { getProductImageUrl } from "@/lib/catalog";
import { formatProductPrice } from "@/lib/format";
import ShareQrDialog from "@/components/barcode/ShareQrDialog";

export default function VendorDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sharingProduct, setSharingProduct] = useState(null);
  useEffect(() => {
    let ignore = false;
    async function loadProducts() {
      try {
        const data = await listProducts({ limit: 100 });
        if (!ignore) {
          setProducts(
            (data?.items ?? []).filter((product) => product.source === "vendor")
          );
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Unable to load vendor products.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    loadProducts();
    return () => {
      ignore = true;
    };
  }, []);
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#e24b6a]">
            Vendor workspace
          </p>
          <h1 className="mt-1 text-3xl font-extrabold text-[#2b2422]">Your products</h1>
          <p className="mt-1 text-sm text-stone-500">
            {loading ? "Loading…" : `${products.length} vendor products`}
          </p>
        </div>
        <Link
          href="/vendor/products/new"
          className="rounded-xl bg-[#e24b6a] px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-rose-200"
        >
          Add product
        </Link>
      </div>
      {error && (
        <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      )}
      {!loading && !error && products.length === 0 && (
        <div className="mt-8 rounded-3xl border-2 border-dashed border-gray-200 bg-white px-6 py-16 text-center">
          <h2 className="text-xl font-extrabold text-[#2b2422]">Add your first product</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">
            Upload catalog details and images. Sukilo will store the product and index
            every image for visual search.
          </p>
          <Link
            href="/vendor/products/new"
            className="mt-5 inline-block rounded-xl bg-[#2b2422] px-5 py-3 text-sm font-bold text-white"
          >
            Create product
          </Link>
        </div>
      )}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => {
          const imageUrl = getProductImageUrl(product);
          return (
            <article
              key={product.id}
              className="flex flex-col rounded-2xl bg-white p-3 shadow-sm ring-1 ring-gray-200"
            >
              <Link href={`/products/${product.id}`} className="flex gap-4">
                <div className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                  {imageUrl && (
                    <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 py-1">
                  <p className="text-xs font-bold uppercase text-[#e24b6a]">
                    {product.category}
                  </p>
                  <h2 className="mt-1 line-clamp-2 text-sm font-extrabold text-[#2b2422]">
                    {product.name}
                  </h2>
                  <p className="mt-2 text-sm font-bold text-stone-700">
                    {formatProductPrice(product.price, product.currency)}
                  </p>
                </div>
              </Link>
              {product.gtin ? (
                <button
                  type="button"
                  onClick={() => setSharingProduct(product)}
                  className="mt-3 rounded-full border border-rose-100 px-3 py-2 text-xs font-bold text-[#2b2422] hover:bg-rose-50"
                >
                  Share barcode
                </button>
              ) : null}
            </article>
          );
        })}
      </div>
      {sharingProduct?.gtin ? (
        <ShareQrDialog
          gtin={String(sharingProduct.gtin)}
          productName={String(sharingProduct.name)}
          onClose={() => setSharingProduct(null)}
        />
      ) : null}
    </main>
  );
}
