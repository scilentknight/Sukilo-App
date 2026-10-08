"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { listCategories, listProducts } from "@/lib/api";
import { sortCatalogProducts } from "@/lib/catalog";
import MarketplaceHeader from "@/components/layout/MarketplaceHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import HeroBanner from "@/components/home/HeroBanner";
import TrustBar from "@/components/home/TrustBar";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import FlashDeals from "@/components/home/FlashDeals";
import CatalogProductCard from "@/components/products/CatalogProductCard";
import HomepageVisualResults from "@/components/search/HomepageVisualResults";
import { useHomepageVisualSearch } from "@/components/search/useHomepageVisualSearch";

const PAGE_SIZE = 48;

export default function MarketplaceHome() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [categorySamples, setCategorySamples] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(
    () => searchParams.get("category")
  );
  const [searchInput, setSearchInput] = useState(
    () => searchParams.get("q") ?? ""
  );
  const [appliedQuery, setAppliedQuery] = useState(
    () => searchParams.get("q") ?? ""
  );
  const [sortBy, setSortBy] = useState("newest");
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const visualSearch = useHomepageVisualSearch();

  useEffect(() => {
    let ignore = false;
    async function loadCategories() {
      try {
        const categoryData = await listCategories();
        const categoryItems = categoryData?.items ?? [];
        const samplePages = await Promise.all(
          categoryItems.map((category) =>
            listProducts({ limit: 1, category: category.name })
          )
        );
        if (!ignore) {
          setCategories(categoryItems);
          setCategorySamples(
            samplePages.flatMap((page) => page?.items ?? [])
          );
        }
      } catch {
        if (!ignore) {
          setCategories([]);
          setCategorySamples([]);
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
    async function loadProducts() {
      try {
        const data = await listProducts({
          skip: 0,
          limit: PAGE_SIZE,
          category: activeCategory ?? undefined,
          q: appliedQuery || undefined,
        });
        if (ignore) {
          return;
        }
        const items = data?.items ?? [];
        setHasMore(items.length === PAGE_SIZE);
        setSkip(items.length);
        setProducts(items);
      } catch (err) {
        if (ignore) {
          return;
        }
        setError(err.message || "Could not load products.");
        setProducts([]);
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
  }, [activeCategory, appliedQuery]);

  const sortedProducts = useMemo(
    () => sortCatalogProducts(products, sortBy),
    [products, sortBy]
  );

  const handleSearchSubmit = () => {
    const query = searchInput.trim();
    setLoading(true);
    setError(null);
    setAppliedQuery(query);
    syncUrl(activeCategory, query);
  };

  const syncUrl = (category, query) => {
    const params = new URLSearchParams();
    if (query) {
      params.set("q", query);
    }
    if (category) {
      params.set("category", category);
    }
    const qs = params.toString();
    router.replace(qs ? `/?${qs}` : "/");
  };

  const handleCategoryChange = (category) => {
    if (category) {
      router.push(`/category/${encodeURIComponent(category)}?page=1`);
      return;
    }
    setActiveCategory(null);
    syncUrl(null, appliedQuery);
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    setError(null);
    try {
      const data = await listProducts({
        skip,
        limit: PAGE_SIZE,
        category: activeCategory ?? undefined,
        q: appliedQuery || undefined,
      });
      const items = data?.items ?? [];
      setHasMore(items.length === PAGE_SIZE);
      setSkip((current) => current + items.length);
      setProducts((current) => [...current, ...items]);
    } catch (err) {
      setError(err.message || "Could not load more products.");
    } finally {
      setLoadingMore(false);
    }
  };

  const titleParts = [];
  if (activeCategory) {
    titleParts.push(activeCategory);
  }
  if (appliedQuery) {
    titleParts.push(`“${appliedQuery}”`);
  }
  const sectionTitle = titleParts.length
    ? titleParts.join(" · ")
    : "Recommended for you";

  return (
    <>
      <MarketplaceHeader
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        searchQuery={searchInput}
        onSearchQueryChange={setSearchInput}
        onSearchSubmit={handleSearchSubmit}
        onVisualFileSelect={visualSearch.searchFile}
      />
      {visualSearch.isActive ? (
        <HomepageVisualResults
          previewUrl={visualSearch.previewUrl}
          status={visualSearch.status}
          results={visualSearch.results}
          errorMessage={visualSearch.errorMessage}
          onClear={visualSearch.clearSearch}
        />
      ) : (
        <>
      <HeroBanner
        onVisualFileSelect={visualSearch.searchFile}
      />
      <TrustBar />
      <CategoryShowcase
        categories={categories}
        products={categorySamples}
        onSelect={handleCategoryChange}
      />
      <FlashDeals products={products} />
      <main id="catalog" className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-rose-100 sm:p-6">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#e24b6a]">
                  Just for you
                </p>
                <h1 className="text-2xl font-extrabold tracking-tight text-[#2b2422] sm:text-3xl">
                  {sectionTitle === "Recommended for you" ? "Discover more" : sectionTitle}
                </h1>
                <p className="mt-1 text-sm text-stone-500">
                  {loading ? "Loading products…" : `${sortedProducts.length} products`}
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold text-stone-500">
                Sort
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="rounded-full border border-rose-100 bg-white px-3 py-2 text-sm font-semibold text-[#2b2422] outline-none"
                >
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                </select>
              </label>
            </div>

            {error && (
              <p className="mb-4 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {error}
              </p>
            )}

            {!loading && sortedProducts.length === 0 && (
              <p className="rounded-sm border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-600">
                No products match your filters. Clear search or pick another category.
              </p>
            )}

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
              {sortedProducts.map((product) => (
                <CatalogProductCard key={product.id} product={product} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={handleLoadMore}
                  className="rounded-full bg-white px-8 py-3 text-sm font-bold text-[#2b2422] shadow-sm ring-1 ring-rose-100 hover:bg-[#2b2422] hover:text-white disabled:opacity-50"
                >
                  {loadingMore ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
        </div>
      </main>
        </>
      )}
      <SiteFooter />
    </>
  );
}
