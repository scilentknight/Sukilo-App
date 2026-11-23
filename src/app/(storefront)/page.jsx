"use client";

import { useEffect, useState } from "react";

import OurServices from "@/components/OurServices";
import ProductCarousel from "@/components/home/ProductCarousel";
import CategorySection from "@/components/home/CategorySection";
import PromoBanner from "@/components/home/PromoBanner";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import TrustSection from "@/components/home/TrustSection";

import { listProducts, listCategories } from "@/services/product.service";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCats, setLoadingCats] = useState(true);

  const [error, setError] = useState(null);

  useEffect(() => {
    listProducts({ limit: 12 })
      .then((data) => {
        setProducts(data?.items ?? data ?? []);
      })
      .catch((error) => {
        setError(error.message || "Failed to load products.");
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
      <ProductCarousel products={products} loading={loadingProducts} />

      <OurServices />

      <CategorySection categories={categories} loading={loadingCats} />

      <PromoBanner />

      <FeaturedProducts
        products={products}
        loading={loadingProducts}
        error={error}
      />

      <TrustSection />
    </main>
  );
}
