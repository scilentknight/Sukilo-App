"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight, Package } from "lucide-react";

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

export default function ProductCarousel({ products = [], loading = false }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const featuredProducts = products.slice(0, 8);
  const totalSlides = featuredProducts.length;

  // Keep active index valid when products change.
  useEffect(() => {
    setActiveIndex((index) => (index >= totalSlides ? 0 : index));
  }, [totalSlides]);

  // Automatic slide rotation.
  useEffect(() => {
    if (totalSlides < 2) return;

    const timer = setInterval(() => {
      setActiveIndex((index) => (index + 1) % totalSlides);
    }, 5000);

    return () => clearInterval(timer);
  }, [totalSlides]);

  const previous = () => {
    setActiveIndex((index) => (index - 1 + totalSlides) % totalSlides);
  };

  const next = () => {
    setActiveIndex((index) => (index + 1) % totalSlides);
  };

  if (loading) {
    return (
      <section className="container-page py-6">
        <div className="skeleton aspect-[3/1] rounded-xl" />
      </section>
    );
  }

  if (!totalSlides) return null;

  return (
    <section className="container-page py-6 sm:py-8">
      <div className="relative overflow-hidden rounded-xl bg-orange-50">
        {/* Sliding track */}
        <div
          className="flex transition-transform duration-700 ease-in-out motion-reduce:transition-none"
          style={{
            transform: `translateX(-${activeIndex * 100}%)`,
          }}
        >
          {featuredProducts.map((product, index) => {
            const productId = getProductId(product);
            const image = getProductImage(product);
            const productName = product.name || product.title || "Product";

            return (
              <div
                key={productId ?? index}
                className="relative w-full flex-none"
              >
                <Link
                  href={`/products/${productId}`}
                  aria-label={`View ${productName}`}
                  className="relative block aspect-[3/1] min-h-[180px] max-h-[480px] overflow-hidden sm:aspect-[3.2/1]"
                >
                  {image ? (
                    <img
                      src={image}
                      alt={productName}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-orange-50">
                      <Package size={80} className="text-orange-200" />
                    </div>
                  )}

                  {/* Image overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

                  {/* Product details */}
                  <div className="absolute inset-y-0 left-0 flex w-[75%] flex-col justify-center p-5 text-white sm:w-1/2 sm:p-10 lg:p-14">
                    <span className="w-fit rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] backdrop-blur-sm sm:text-xs">
                      {product.category?.name ||
                        product.category ||
                        "Featured product"}
                    </span>

                    <h2 className="mt-3 line-clamp-2 text-xl font-black leading-tight sm:mt-5 sm:text-3xl lg:text-5xl">
                      {productName}
                    </h2>

                    <p className="mt-2 line-clamp-2 text-xs text-white/85 sm:mt-4 sm:text-sm lg:text-base">
                      {product.description ||
                        "Discover something special, selected for you."}
                    </p>

                    <p className="mt-3 text-lg font-bold sm:mt-5 sm:text-2xl">
                      {product.currency || "NPR"}{" "}
                      {Number(product.price || 0).toLocaleString()}
                    </p>

                    <span className="mt-4 inline-flex w-fit items-center gap-2 rounded-md bg-white px-4 py-2 text-xs font-bold text-orange-600 transition hover:bg-orange-50 sm:mt-6 sm:px-6 sm:py-3 sm:text-sm">
                      Shop now
                      <ArrowUpRight size={16} />
                    </span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Navigation arrows */}
        {totalSlides > 1 && (
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
        {totalSlides > 1 && (
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
        )}
      </div>
    </section>
  );
}
