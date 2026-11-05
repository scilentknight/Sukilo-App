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

import OurServices from "@/components/OurServices";
import ProductGrid from "@/components/products/ProductGrid";
import { listProducts, listCategories } from "@/services/product.service";
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

function ProductCarousel({ products, loading }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const featuredProducts = products.slice(0, 8);
  const activeProduct = featuredProducts[activeIndex];

  useEffect(() => {
    if (featuredProducts.length < 2) return;

    const timer = setInterval(() => {
      setActiveIndex((index) => (index + 1) % featuredProducts.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [featuredProducts.length]);

  const previous = () => {
    setActiveIndex(
      (index) =>
        (index - 1 + featuredProducts.length) % featuredProducts.length,
    );
  };

  const next = () => {
    setActiveIndex((index) => (index + 1) % featuredProducts.length);
  };

  if (loading) {
    return (
      <section className="container-page py-6">
        <div className="skeleton aspect-[3/1] rounded-xl" />
      </section>
    );
  }

  if (!activeProduct) return null;

  const productId = getProductId(activeProduct);
  const image = getProductImage(activeProduct);
  const productName = activeProduct.name || activeProduct.title;

  return (
    <section className="container-page py-6 sm:py-8">
      {/* Main promotional banner */}
      <div className="relative overflow-hidden rounded-xl bg-orange-50">
        <AnimatePresence mode="wait">
          <motion.div
            key={productId ?? activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="relative"
          >
            <Link
              href={`/products/${productId}`}
              aria-label={`View ${productName}`}
              className="relative block aspect-[3/1] min-h-[180px] max-h-[480px] overflow-hidden sm:aspect-[3.2/1]"
            >
              {image ? (
                <motion.img
                  src={image}
                  alt={productName}
                  initial={{ scale: 1.04 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-orange-50">
                  <Package size={80} className="text-orange-200" />
                </div>
              )}

              {/* Readability overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

              {/* Product details */}
              <div className="absolute inset-y-0 left-0 flex w-[75%] flex-col justify-center p-5 text-white sm:w-1/2 sm:p-10 lg:p-14">
                <span className="w-fit rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] backdrop-blur-sm sm:text-xs">
                  {activeProduct.category?.name ||
                    activeProduct.category ||
                    "Featured product"}
                </span>

                <h2 className="mt-3 line-clamp-2 text-xl font-black leading-tight sm:mt-5 sm:text-3xl lg:text-5xl">
                  {productName}
                </h2>

                <p className="mt-2 line-clamp-2 text-xs text-white/85 sm:mt-4 sm:text-sm lg:text-base">
                  {activeProduct.description ||
                    "Discover something special, selected for you."}
                </p>

                <p className="mt-3 text-lg font-bold sm:mt-5 sm:text-2xl">
                  {activeProduct.currency || "NPR"}{" "}
                  {Number(activeProduct.price || 0).toLocaleString()}
                </p>

                <span className="mt-4 inline-flex w-fit items-center gap-2 rounded-md bg-white px-4 py-2 text-xs font-bold text-orange-600 transition hover:bg-orange-50 sm:mt-6 sm:px-6 sm:py-3 sm:text-sm">
                  Shop now
                  <ArrowUpRight size={16} />
                </span>
              </div>
            </Link>
          </motion.div>
        </AnimatePresence>

        {/* Previous and next arrows */}
        {featuredProducts.length > 1 && (
          <>
            <button
              type="button"
              onClick={previous}
              aria-label="Previous slide"
              className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-900 shadow-md transition hover:bg-white sm:left-4 sm:h-11 sm:w-11"
            >
              <ChevronLeft size={22} />
            </button>

            <button
              type="button"
              onClick={next}
              aria-label="Next slide"
              className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-900 shadow-md transition hover:bg-white sm:right-4 sm:h-11 sm:w-11"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}

        {/* Slide indicators */}
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 sm:bottom-4">
          {featuredProducts.map((product, index) => (
            <button
              key={getProductId(product) ?? index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show ${product.name || product.title}`}
              aria-current={index === activeIndex}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? "w-6 bg-white"
                  : "w-1.5 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Thumbnail navigation */}
      {featuredProducts.length > 1 && (
        <div className="mt-3 flex justify-center gap-2 overflow-x-auto pb-1">
          {featuredProducts.map((product, index) => {
            const thumbnail = getProductImage(product);

            return (
              <button
                key={getProductId(product) ?? index}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Show ${product.name || product.title}`}
                className={`relative h-12 w-16 shrink-0 overflow-hidden rounded-md border-2 bg-white transition sm:h-16 sm:w-24 ${
                  index === activeIndex
                    ? "border-orange-500"
                    : "border-transparent hover:border-orange-200"
                }`}
              >
                {thumbnail && (
                  <img
                    src={thumbnail}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
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
      <ProductCarousel products={products} loading={loadingProducts} />
      <OurServices />

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
          {loadingCats
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton aspect-square rounded-2xl" />
              ))
            : categories.map((cat) => {
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
              })}
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
                <h3 className="text-sm font-bold text-ink-900">{title}</h3>

                <p className="mt-1 text-xs text-ink-500">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
