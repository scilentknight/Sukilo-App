"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getProductImageUrl } from "@/lib/catalog";
import { formatProductPrice } from "@/lib/format";
import SiteFooter from "@/components/layout/SiteFooter";
import MarketplaceHeader from "@/components/layout/MarketplaceHeader";
import ShareQrDialog from "@/components/barcode/ShareQrDialog";
import VisualSearchTrigger from "@/components/search/VisualSearchTrigger";
import { startVisualSearchOnHome } from "@/lib/visualSearchSession";

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id;
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (!productId) {
      return;
    }
    let ignore = false;
    async function load() {
      setLoading(true);
      try {
        const data = await apiFetch(`/api/v1/products/${productId}`);
        if (!ignore) {
          setProduct(data);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Product not found.");
          setProduct(null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [productId]);

  const imageSrc = product ? getProductImageUrl(product) : null;

  return (
    <>
      <MarketplaceHeader
        categories={[]}
        activeCategory={null}
        onCategoryChange={() => router.push("/")}
        searchQuery={searchInput}
        onSearchQueryChange={setSearchInput}
        onSearchSubmit={() => {
          const q = searchInput.trim();
          router.push(q ? `/?q=${encodeURIComponent(q)}` : "/");
        }}
        onVisualFileSelect={(file) => startVisualSearchOnHome(router, file)}
      />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/" className="text-sm font-semibold text-[#ff3f6c] hover:underline">
          ← Back to shop
        </Link>
        {loading && <p className="mt-6 text-gray-600">Loading product…</p>}
        {error && (
          <p className="mt-6 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}
        {product && (
          <div className="mt-6 grid gap-8 lg:grid-cols-2">
            <div className="order-2 aspect-square overflow-hidden rounded-sm border border-gray-200 bg-gray-100 lg:order-1">
              {imageSrc ? (
                <img src={imageSrc} alt={product.name} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                {product.brand || product.category}
              </p>
              <h1 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">
                {product.name}
              </h1>
              <p className="mt-4 text-2xl font-extrabold text-gray-900">
                {formatProductPrice(product.price, product.currency)}
              </p>
              {product.description && (
                <p className="mt-4 text-sm leading-relaxed text-gray-600">
                  {product.description}
                </p>
              )}
              <div className="mt-6 flex flex-wrap gap-3">
                <VisualSearchTrigger
                  onSelect={(file) => startVisualSearchOnHome(router, file)}
                  className="inline-flex rounded-xl bg-[#ff3f6c] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#ff3f6c]/25 hover:bg-[#e5365f]"
                >
                  Find similar by photo
                </VisualSearchTrigger>
                {product.gtin ? (
                  <button
                    type="button"
                    onClick={() => setShareOpen(true)}
                    className="inline-flex rounded-xl border border-rose-200 bg-white px-6 py-3 text-sm font-bold text-[#2b2422] hover:bg-rose-50"
                  >
                    Share barcode
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        )}
        {shareOpen && product?.gtin ? (
          <ShareQrDialog
            gtin={String(product.gtin)}
            productName={String(product.name)}
            onClose={() => setShareOpen(false)}
          />
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}
