
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";

import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Headphones,
  House,
  Laptop,
  Package,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  Watch,
} from "lucide-react";

import ProductGrid from "@/components/products/ProductGrid";
import { listProducts, listCategories } from "@/lib/products";
import { Alert } from "@/components/ui";

// ================================
// CATEGORY ICONS
// ================================

const CATEGORY_ICONS = {
  Electronics: Laptop,
  "Fashion & Apparel": ShoppingBag,
  "Home & Kitchen": House,
  "Sports & Outdoors": Watch,
  "Beauty & Wellness": Sparkles,
  "Books & Media": BookOpen,
};

// ================================
// TRUST ITEMS
// ================================

const TRUST_ITEMS = [
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Reliable delivery across Nepal",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description: "Safe and secure checkout",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "Hassle-free returns",
  },
  {
    icon: Headphones,
    title: "Customer Support",
    description: "We're here to help",
  },
];

// ================================
// PRODUCT HELPERS
// ================================

function getProductImage(product) {
  return (
    product.images?.[0]?.url ||
    product.images?.[0]?.image_url ||
    product.image_url ||
    product.image ||
    null
  );
}

function getProductId(product) {
  return product.id ?? product.product_id;
}

// ================================
// PRODUCT CAROUSEL
// ================================

function ProductCarousel({ products, loading }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const featuredProducts = products.slice(0, 8);
  const activeProduct = featuredProducts[activeIndex];

  // Automatic carousel rotation
  useEffect(() => {
    if (featuredProducts.length < 2) return;

    const timer = setInterval(() => {
      setActiveIndex((index) => (index + 1) % featuredProducts.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [featuredProducts.length]);

  // Previous product
  const previous = () => {
    setActiveIndex(
      (index) =>
        (index - 1 + featuredProducts.length) % featuredProducts.length
    );
  };

  // Next product
  const next = () => {
    setActiveIndex((index) => (index + 1) % featuredProducts.length);
  };

  // Loading state
  if (loading) {
    return (
      <section className="container-page py-8 sm:py-12">
        <div className="skeleton aspect-[16/7] rounded-3xl" />
      </section>
    );
  }

  if (!activeProduct) return null;

  const productId = getProductId(activeProduct);
  const image = getProductImage(activeProduct);

  return (
    <section className="container-page py-8 sm:py-12">

      {/* Section heading */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
            Discover something new
          </p>

          <h2 className="mt-2 text-2xl font-black text-ink-900 sm:text-3xl">
            Featured finds
          </h2>
        </div>

        <Link
          href="/products"
          className="hidden items-center gap-2 text-sm font-semibold text-ink-700 transition hover:text-brand-600 sm:flex"
        >
          Explore all <ArrowRight size={16} />
        </Link>
      </div>

      {/* Carousel container */}
      <div className="relative overflow-hidden rounded-3xl bg-ink-50">

        {/* Animated product content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={productId ?? activeIndex}
            initial={{
              opacity: 0,
              x: 45,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            exit={{
              opacity: 0,
              x: -45,
            }}
            transition={{
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="grid min-h-[360px] grid-cols-1 md:grid-cols-2"
          >

            {/* Product information */}
            <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-14">

              <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
                {activeProduct.category?.name ||
                  activeProduct.category ||
                  "Featured product"}
              </p>

              <h3 className="mt-4 line-clamp-2 text-3xl font-black leading-tight text-ink-900 sm:text-4xl">
                {activeProduct.name || activeProduct.title}
              </h3>

              <p className="mt-4 line-clamp-3 max-w-md text-sm leading-6 text-ink-500">
                {activeProduct.description ||
                  "Discover quality products selected for your everyday needs."}
              </p>

              <p className="mt-6 text-2xl font-bold text-ink-900">
                {activeProduct.currency || "NPR"}{" "}
                {Number(activeProduct.price || 0).toLocaleString()}
              </p>

              {/* View product button */}
              <Link
                href={`/products/${productId}`}
                className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700"
              >
                View product
                <ArrowUpRight size={18} />
              </Link>

              {/* Pagination indicators */}
              <div className="mt-8 flex items-center gap-2">
                {featuredProducts.map((product, index) => (
                  <button
                    key={getProductId(product) ?? index}
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Show ${product.name || product.title}`}
                    aria-current={index === activeIndex}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === activeIndex
                        ? "w-8 bg-brand-600"
                        : "w-2 bg-ink-300 hover:bg-brand-400"
                    }`}
                  />
                ))}
              </div>

              <p className="mt-3 text-xs text-ink-400">
                {activeIndex + 1} / {featuredProducts.length} products
              </p>
            </div>

            {/* Product image area */}
            <div className="group relative flex min-h-[280px] items-center justify-center overflow-hidden bg-white p-8 sm:p-12">

              {/* Clickable product image */}
              <Link
                href={`/products/${productId}`}
                className="absolute inset-0 flex items-center justify-center p-8 sm:p-12"
                aria-label={`View ${activeProduct.name || activeProduct.title}`}
              >
                {image ? (
                  <motion.img
                    src={image}
                    alt={activeProduct.name || activeProduct.title}
                    initial={{
                      opacity: 0,
                      scale: 0.9,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    transition={{
                      duration: 0.6,
                      ease: "easeOut",
                    }}
                    className="h-full max-h-[420px] w-full object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <Package size={100} className="text-ink-200" />
                )}
              </Link>

              {/* Previous arrow */}
              {featuredProducts.length > 1 && (
                <button
                  type="button"
                  onClick={previous}
                  aria-label="Previous product"
                  className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-ink-100 bg-white/95 p-3 text-ink-800 shadow-md transition-all duration-300 hover:scale-110 hover:bg-brand-600 hover:text-white sm:left-5"
                >
                  <ChevronLeft size={22} />
                </button>
              )}

              {/* Next arrow */}
              {featuredProducts.length > 1 && (
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next product"
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-ink-100 bg-white/95 p-3 text-ink-800 shadow-md transition-all duration-300 hover:scale-110 hover:bg-brand-600 hover:text-white sm:right-5"
                >
                  <ChevronRight size={22} />
                </button>
              )}

              {/* Product details icon */}
              <Link
                href={`/products/${productId}`}
                aria-label="Open product details"
                className="absolute bottom-5 right-5 z-10 rounded-full bg-white p-3 text-ink-800 shadow-md transition hover:bg-brand-600 hover:text-white"
              >
                <ArrowUpRight size={20} />
              </Link>

            </div>

          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}

// ================================
// HOME PAGE
// ================================

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCats, setLoadingCats] = useState(true);

  const [error, setError] = useState(null);

  // Fetch products and categories
  useEffect(() => {
    listProducts({ limit: 12 })
      .then((data) => {
        setProducts(data?.items ?? data ?? []);
      })
      .catch((e) => {
        setError(e.message);
      })
      .finally(() => {
        setLoadingProducts(false);
      });

    listCategories()
      .then((data) => {
        setCategories(data?.items ?? []);
      })
      .catch(() => {})
      .finally(() => {
        setLoadingCats(false);
      });
  }, []);

  return (
    <main className="bg-white">

      {/* =========================
          PRODUCT CAROUSEL
      ========================= */}
      <ProductCarousel
        products={products}
        loading={loadingProducts}
      />

      {/* =========================
          SHOP BY CATEGORY
      ========================= */}
      <section className="container-page py-10 sm:py-14">

        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
              Find your favorites
            </p>

            <h2 className="mt-2 text-2xl font-bold text-ink-900">
              Shop by category
            </h2>
          </div>

          <Link
            href="/products"
            className="flex items-center gap-1 text-sm font-semibold text-brand-600 transition hover:text-brand-700"
          >
            View all <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">

          {loadingCats ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="skeleton aspect-square rounded-2xl"
              />
            ))
          ) : (
            categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.name] || ShoppingBag;

              return (
                <Link
                  key={cat.id || cat.name}
                  href={`/products?category=${encodeURIComponent(cat.name)}`}
                  className="group flex flex-col items-center justify-center gap-4 rounded-2xl border border-ink-100 bg-white p-5 text-center transition duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-50 text-ink-700 transition group-hover:bg-brand-600 group-hover:text-white">
                    <Icon size={26} strokeWidth={1.7} />
                  </span>

                  <span className="text-sm font-semibold text-ink-800">
                    {cat.name}
                  </span>

                  <span className="text-xs text-ink-400">
                    {cat.count ?? 0} products
                  </span>
                </Link>
              );
            })
          )}

        </div>
      </section>

      {/* =========================
          PROMOTIONAL BANNER
      ========================= */}
      <section className="container-page pb-12">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-brand-700 p-8 text-white sm:flex-row sm:items-center sm:p-12">

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-200">
              A little extra for you
            </p>

            <h2 className="mt-3 text-2xl font-black sm:text-3xl">
              Free shipping on orders over NPR 5,000
            </h2>

            <p className="mt-3 max-w-lg text-sm text-brand-100">
              Find your next favorite and enjoy reliable delivery across Nepal.
            </p>
          </div>

          <Link
            href="/products"
            className="flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-brand-700 transition hover:bg-brand-50"
          >
            Shop now <ArrowRight size={18} />
          </Link>

        </div>
      </section>

      {/* =========================
          FEATURED PRODUCTS
      ========================= */}
      <section className="container-page pb-14 sm:pb-20">

        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
              Handpicked for you
            </p>

            <h2 className="mt-2 text-2xl font-bold text-ink-900">
              Explore our collection
            </h2>
          </div>

          <Link
            href="/products"
            className="flex items-center gap-2 text-sm font-semibold text-brand-600 transition hover:text-brand-700"
          >
            View all <ArrowRight size={16} />
          </Link>
        </div>

        {error && (
          <Alert type="error" className="mb-4">
            {error}
          </Alert>
        )}

        <ProductGrid
          products={products}
          isLoading={loadingProducts}
          columns={4}
        />

      </section>

      {/* =========================
          TRUST BADGES
      ========================= */}
      <section className="border-t border-ink-100 bg-ink-50">

        <div className="container-page grid grid-cols-2 gap-8 py-10 sm:grid-cols-4 sm:py-14">

          {TRUST_ITEMS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col items-center gap-3 text-center"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-brand-600 shadow-sm">
                <Icon size={22} strokeWidth={1.7} />
              </span>

              <div>
                <h3 className="text-sm font-bold text-ink-900">
                  {title}
                </h3>

                <p className="mt-1 text-xs text-ink-500">
                  {description}
                </p>
              </div>
            </div>
          ))}

        </div>
      </section>

    </main>
  );
}
