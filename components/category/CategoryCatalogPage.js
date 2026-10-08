"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import MarketplaceHeader from "@/components/layout/MarketplaceHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import CatalogProductCard from "@/components/products/CatalogProductCard";
import Pagination from "@/components/category/Pagination";
import { useCategoryCatalog } from "@/components/category/useCategoryCatalog";
import { startVisualSearchOnHome } from "@/lib/visualSearchSession";

export default function CategoryCatalogPage() {
  const catalog = useCategoryCatalog();
  const router = useRouter();
  return (
    <>
      <MarketplaceHeader
        categories={catalog.categories}
        activeCategory={catalog.category}
        onCategoryChange={catalog.navigateCategory}
        searchQuery={catalog.searchInput}
        onSearchQueryChange={catalog.setSearchInput}
        onSearchSubmit={catalog.submitSearch}
        onVisualFileSelect={(file) => startVisualSearchOnHome(router, file)}
      />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="text-sm font-semibold text-stone-500">
          <Link href="/" className="hover:text-[#e24b6a]">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-[#2b2422]">{catalog.category}</span>
        </nav>
        <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-rose-100 sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#e24b6a]">
                Department
              </p>
              <h1 className="mt-1 text-3xl font-extrabold text-[#2b2422] sm:text-4xl">
                {catalog.category}
              </h1>
              <p className="mt-1 text-sm text-stone-500">
                {catalog.loading ? "Loading products…" : `${catalog.total} products`}
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold text-stone-500">
              Sort
              <select
                value={catalog.sortBy}
                onChange={(event) => catalog.setSortBy(event.target.value)}
                className="rounded-full border border-rose-100 bg-white px-3 py-2 font-semibold text-[#2b2422] outline-none"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </label>
          </div>
          {catalog.error && (
            <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
              {catalog.error}
            </p>
          )}
          {!catalog.loading && !catalog.error && catalog.sortedProducts.length === 0 && (
            <p className="py-16 text-center text-sm text-stone-500">
              No products are available in this category.
            </p>
          )}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-6">
            {catalog.sortedProducts.map((product) => (
              <CatalogProductCard key={product.id} product={product} />
            ))}
          </div>
          <Pagination
            currentPage={catalog.page}
            totalPages={catalog.totalPages}
            onPageChange={catalog.navigatePage}
          />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
