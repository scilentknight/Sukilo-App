"use client";

import { useEffect, useState } from "react";


import ProductCarousel from "@/components/home/ProductCarousel";
import ForYouSection from "@/components/home/ForYouSection";
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
      .then((response) => {
        console.log("Products API Response:", response);

        // Extract products from API response
        const data = response?.data ?? response;

        const productList = Array.isArray(data)
          ? data
          : (data?.items ?? data?.products ?? data?.data ?? []);

        console.log("Products:", productList);

        setProducts(productList);
      })
      .catch((error) => {
        console.error("Products Error:", error);
        setError(error.message || "Failed to load products.");
      })
      .finally(() => {
        setLoadingProducts(false);
      });

    listCategories()
      .then((response) => {
        const data = response?.data ?? response;

        setCategories(
          Array.isArray(data) ? data : (data?.items ?? data?.categories ?? []),
        );
      })
      .catch((error) => {
        console.error("Categories Error:", error);
      })
      .finally(() => {
        setLoadingCats(false);
      });
  }, []);

  return (
    <main className="bg-white">
      <ProductCarousel products={products} loading={loadingProducts} />

      <ForYouSection products={products} />

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
