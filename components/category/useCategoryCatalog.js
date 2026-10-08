"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { listCategories, listProducts } from "@/lib/api";
import { sortCatalogProducts } from "@/lib/catalog";

export const CATEGORY_PAGE_SIZE = 24;

export function useCategoryCatalog() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = decodeURIComponent(String(params.name ?? ""));
  const requestedPage = Number(searchParams.get("page") ?? "1");
  const page = Number.isInteger(requestedPage) && requestedPage > 0
    ? requestedPage
    : 1;
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("newest");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function loadCategories() {
      try {
        const data = await listCategories();
        if (!ignore) {
          setCategories(data?.items ?? []);
        }
      } catch {
        if (!ignore) {
          setCategories([]);
        }
      }
    }
    loadCategories();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    async function loadPage() {
      try {
        const data = await listProducts({
          skip: (page - 1) * CATEGORY_PAGE_SIZE,
          limit: CATEGORY_PAGE_SIZE,
          category,
        });
        if (!ignore) {
          setProducts(data?.items ?? []);
          setTotal(data?.total ?? 0);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setProducts([]);
          setTotal(0);
          setError(err.message || "Could not load this category.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    loadPage();
    return () => {
      ignore = true;
    };
  }, [category, page]);

  const sortedProducts = useMemo(
    () => sortCatalogProducts(products, sortBy),
    [products, sortBy]
  );
  const totalPages = Math.max(1, Math.ceil(total / CATEGORY_PAGE_SIZE));
  const navigateCategory = (name) => {
    setLoading(true);
    router.push(name ? `/category/${encodeURIComponent(name)}?page=1` : "/");
  };
  const navigatePage = (nextPage) => {
    setLoading(true);
    router.push(`/category/${encodeURIComponent(category)}?page=${nextPage}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const submitSearch = () => {
    const query = searchInput.trim();
    router.push(query ? `/?q=${encodeURIComponent(query)}` : "/");
  };
  return {
    category, page, categories, sortedProducts, total, totalPages,
    sortBy, setSortBy, searchInput, setSearchInput, loading, error,
    navigateCategory, navigatePage, submitSearch,
  };
}
