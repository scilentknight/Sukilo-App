"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import CameraIcon from "@/components/icons/CameraIcon";
import BarcodeIcon from "@/components/icons/BarcodeIcon";
import BarcodeCaptureTrigger from "@/components/barcode/BarcodeCaptureTrigger";
import VisualSearchTrigger from "@/components/search/VisualSearchTrigger";

/**
 * @param {{
 *   categories: Array<{ name: string, count: number }>,
 *   activeCategory: string | null,
 *   onCategoryChange: (category: string | null) => void,
 *   searchQuery: string,
 *   onSearchQueryChange: (value: string) => void,
 *   onSearchSubmit: () => void,
 *   onVisualFileSelect: (file: File) => void,
 * }} props
 */
export default function MarketplaceHeader({
  categories,
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchQueryChange,
  onSearchSubmit,
  onVisualFileSelect,
}) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearchSubmit();
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    }
    if (activeCategory) {
      params.set("category", activeCategory);
    }
    const query = params.toString();
    router.push(query ? `/?${query}` : "/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-rose-100/80 bg-white/90 backdrop-blur-xl">
      <div className="hidden bg-[#2b2422] text-white/75 sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-1.5 text-[11px] font-semibold">
          <p>Free visual search across the entire catalog</p>
          <div className="flex items-center gap-5">
            <span>New arrivals weekly</span>
            <span>Client demo store</span>
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e24b6a] text-lg font-extrabold text-white shadow-lg shadow-rose-300/50">
            S
          </span>
          <span className="hidden text-xl font-extrabold tracking-tight text-[#2b2422] sm:inline">
            Sukilo
          </span>
        </Link>

        <form onSubmit={handleSubmit} className="flex min-w-0 flex-1">
          <div className="flex w-full items-center rounded-full border border-rose-100 bg-white shadow-sm shadow-rose-100/80 focus-within:border-rose-300 focus-within:shadow-md">
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder="Search products…"
              className="min-w-0 flex-1 rounded-full border-0 bg-transparent py-3 pl-4 pr-2 text-sm text-[#2b2422] outline-none placeholder:text-stone-400"
            />
            <BarcodeCaptureTrigger className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-stone-500 hover:bg-rose-50 hover:text-[#e24b6a]">
              <BarcodeIcon />
            </BarcodeCaptureTrigger>
            <VisualSearchTrigger
              onSelect={onVisualFileSelect}
              className="mr-1 h-11 w-11 shrink-0 rounded-full text-stone-500 hover:bg-rose-50 hover:text-[#e24b6a]"
            >
              <CameraIcon />
            </VisualSearchTrigger>
            <button
              type="submit"
              className="mr-1.5 hidden h-9 shrink-0 rounded-full bg-[#2b2422] px-4 text-xs font-bold text-white hover:bg-[#e24b6a] sm:inline"
            >
              Search
            </button>
          </div>
        </form>

        <div className="hidden items-center gap-1 md:flex">
          <button
            type="button"
            className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold text-[#2b2422] hover:bg-rose-50"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21a8 8 0 0 1 16 0" />
            </svg>
            <span className="hidden xl:inline">Account</span>
          </button>
          <button
            type="button"
            className="relative flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold text-[#2b2422] hover:bg-rose-50"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M3 3h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 7H6" />
              <circle cx="10" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
            </svg>
            <span className="hidden xl:inline">Cart</span>
            <span className="absolute right-1 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#e24b6a] text-[9px] font-bold text-white">
              0
            </span>
          </button>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-rose-100 bg-white lg:hidden"
          aria-label="Toggle categories"
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          <span className="flex flex-col gap-1" aria-hidden>
            <span className="block h-px w-4 bg-[#2b2422]" />
            <span className="block h-px w-4 bg-[#2b2422]" />
            <span className="block h-px w-4 bg-[#2b2422]" />
          </span>
        </button>
      </div>

      <nav className="hidden lg:block">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-3 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => onCategoryChange(null)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              activeCategory === null
                ? "bg-[#2b2422] text-white"
                : "text-stone-600 hover:bg-rose-50 hover:text-[#e24b6a]"
            }`}
          >
            Everything
          </button>
          {categories.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => onCategoryChange(cat.name)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                activeCategory === cat.name
                  ? "bg-[#e24b6a] text-white"
                  : "text-stone-600 hover:bg-rose-50 hover:text-[#e24b6a]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="border-t border-rose-100 bg-white px-4 py-4 lg:hidden">
          <BarcodeCaptureTrigger
            onOpen={() => setMobileMenuOpen(false)}
            className="mb-2 flex w-full items-center justify-center gap-2 rounded-full bg-[#2b2422] py-3 text-sm font-bold text-white"
          >
            <BarcodeIcon className="h-4 w-4" />
            Search by barcode
          </BarcodeCaptureTrigger>
          <VisualSearchTrigger
            onSelect={(file) => {
              setMobileMenuOpen(false);
              onVisualFileSelect(file);
            }}
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#e24b6a] py-3 text-sm font-bold text-white"
          >
            <CameraIcon className="h-4 w-4" />
            Search by photo
          </VisualSearchTrigger>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                onCategoryChange(null);
                setMobileMenuOpen(false);
              }}
              className="rounded-full bg-[#2b2422] px-3 py-1.5 text-xs font-bold text-white"
            >
              Everything
            </button>
            {categories.map((cat) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => {
                  onCategoryChange(cat.name);
                  setMobileMenuOpen(false);
                }}
                className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-[#2b2422]"
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
