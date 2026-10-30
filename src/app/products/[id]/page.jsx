"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getProduct } from "@/lib/products";
import { resolveAssetUrl } from "@/lib/api";
import { Skeleton, Alert } from "@/components/ui";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    getProduct(id)
      .then((p) => {
        setProduct(p);
        const primary = p.images?.find((i) => i.is_primary) ?? p.images?.[0];
        setActiveImage(primary?.image_url ?? null);
      })
      .catch((e) => {
        if (e.status === 404) setError("not_found");
        else setError(e.message);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container-page py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="flex flex-col gap-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-32 mt-2" />
            <Skeleton className="h-4 w-full mt-4" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  if (error === "not_found") {
    return (
      <div className="container-page py-24 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-ink-800 mb-2">Product not found</h1>
        <p className="text-ink-500 mb-6">This product doesn&apos;t exist or has been removed.</p>
        <Link href="/products" className="px-6 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition-colors">
          Back to Products
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-page py-10">
        <Alert type="error">{error}</Alert>
      </div>
    );
  }

  const price = parseFloat(product.price || 0).toFixed(2);
  const activeImgSrc = activeImage ? resolveAssetUrl(activeImage) : null;

  return (
    <div className="container-page py-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-ink-500 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-brand-600">Products</Link>
        <span>/</span>
        <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-brand-600">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-ink-700 truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image gallery */}
        <div className="flex flex-col gap-3">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-ink-50 border border-ink-100">
            {activeImgSrc ? (
              <Image
                src={activeImgSrc}
                alt={product.name}
                fill
                className="object-cover"
                unoptimized={activeImgSrc.startsWith("http")}
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-ink-300">
                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          {/* Thumbnail row */}
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {product.images.map((img) => {
                const src = resolveAssetUrl(img.image_url);
                return (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(img.image_url)}
                    className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImage === img.image_url
                        ? "border-brand-500"
                        : "border-ink-100 hover:border-ink-300"
                    }`}
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized={src.startsWith("http")}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="flex flex-col gap-4">
          <div>
            <span className="inline-block text-xs font-semibold uppercase tracking-wide text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full mb-3">
              {product.category}
            </span>
            {product.brand && (
              <p className="text-sm text-ink-500 mb-1">by <span className="font-medium text-ink-700">{product.brand}</span></p>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-ink-900 leading-tight">
              {product.name}
            </h1>
          </div>

          <div className="flex items-baseline gap-2 py-2">
            <span className="text-3xl font-black text-ink-900">
              {product.currency} {price}
            </span>
          </div>

          {product.description && (
            <div className="bg-ink-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-ink-700 mb-2">About this product</h3>
              <p className="text-sm text-ink-600 leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Meta info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {product.gtin && (
              <div className="bg-white border border-ink-100 rounded-lg p-3">
                <p className="text-xs text-ink-400 mb-0.5">GTIN / Barcode</p>
                <p className="font-medium text-ink-700">{product.gtin}</p>
              </div>
            )}
            <div className="bg-white border border-ink-100 rounded-lg p-3">
              <p className="text-xs text-ink-400 mb-0.5">Currency</p>
              <p className="font-medium text-ink-700">{product.currency}</p>
            </div>
          </div>

          {/* Back link */}
          <div className="mt-4 pt-4 border-t border-ink-100">
            <Link
              href={`/products?category=${encodeURIComponent(product.category)}`}
              className="text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              ← More {product.category}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

