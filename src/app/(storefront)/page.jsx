"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductGrid from "@/components/products/ProductGrid";
import { listProducts, listCategories } from "@/lib/products";
import { Alert } from "@/components/ui";

const CATEGORY_ICONS = {
  "Electronics": "💻",
  "Fashion & Apparel": "👗",
  "Home & Kitchen": "🏠",
  "Sports & Outdoors": "⚽",
  "Beauty & Wellness": "✨",
  "Books & Media": "📚",
};

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCats, setLoadingCats] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    listProducts({ limit: 12 })
      .then((data) => setProducts(data?.items ?? data ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoadingProducts(false));

    listCategories()
      .then((data) => setCategories(data?.items ?? []))
      .catch(() => {})
      .finally(() => setLoadingCats(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-ink-900 via-brand-900 to-ink-800 text-white">
        <div className="container-page py-16 sm:py-24 flex flex-col items-start gap-6 max-w-3xl">
          <span className="inline-block bg-brand-500/20 text-brand-300 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full border border-brand-500/30">
            New arrivals every week
          </span>
          <h1 className="text-4xl sm:text-6xl font-black leading-tight">
            Shop smarter.<br />
            <span className="text-brand-400">Live better.</span>
          </h1>
          <p className="text-ink-300 text-lg max-w-lg">
            Discover thousands of quality products across electronics, fashion, home goods, and more — all in one place.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/products"
              className="px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-colors text-base"
            >
              Shop Now
            </Link>
            <Link
              href="/auth/register"
              className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors text-base border border-white/20"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Category grid */}
      <section className="container-page py-12">
        <h2 className="text-xl font-bold text-ink-800 mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {loadingCats
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton rounded-xl aspect-square" />
              ))
            : categories.map((cat) => (
                <Link
                  key={cat.name}
                  href={`/products?category=${encodeURIComponent(cat.name)}`}
                  className="flex flex-col items-center justify-center gap-2 bg-white rounded-xl border border-ink-100 p-4 text-center hover:border-brand-300 hover:shadow-md transition-all group"
                >
                  <span className="text-3xl">
                    {CATEGORY_ICONS[cat.name] ?? "🛒"}
                  </span>
                  <span className="text-xs font-medium text-ink-700 group-hover:text-brand-700 leading-snug">
                    {cat.name}
                  </span>
                  <span className="text-xs text-ink-400">{cat.count} items</span>
                </Link>
              ))}
        </div>
      </section>

      {/* Promotional banner */}
      <section className="container-page pb-8">
        <div className="rounded-2xl bg-gradient-to-r from-brand-600 to-brand-800 text-white p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl sm:text-3xl font-black mb-2">
              Free shipping on orders over NPR 5,000
            </h3>
            <p className="text-brand-200 text-sm">
              Shop now and enjoy fast, reliable delivery across Nepal.
            </p>
          </div>
          <Link
            href="/products"
            className="flex-shrink-0 px-8 py-3 bg-white text-brand-700 font-bold rounded-xl hover:bg-brand-50 transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Featured products */}
      <section className="container-page pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-ink-800">Featured Products</h2>
          <Link href="/products" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
            View all →
          </Link>
        </div>
        {error && (
          <Alert type="error" className="mb-4">
            {error}
          </Alert>
        )}
        <ProductGrid products={products} isLoading={loadingProducts} columns={4} />
      </section>

      {/* Trust badges */}
      <section className="bg-ink-50 border-t border-ink-100">
        <div className="container-page py-10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { icon: "🚚", title: "Fast Delivery", desc: "2-5 business days" },
            { icon: "🔒", title: "Secure Payments", desc: "SSL encrypted checkout" },
            { icon: "↩️", title: "Easy Returns", desc: "30-day return policy" },
            { icon: "🎧", title: "24/7 Support", desc: "Always here to help" },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center gap-2">
              <span className="text-3xl">{icon}</span>
              <p className="font-semibold text-sm text-ink-800">{title}</p>
              <p className="text-xs text-ink-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

