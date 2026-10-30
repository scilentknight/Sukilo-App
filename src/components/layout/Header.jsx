"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { user, isAdmin, signOut, isLoading } = useAuth();

  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
  }

  async function handleSignOut() {
    setAccountOpen(false);
    await signOut();
    router.push("/");
  }

  return (

    <header className="sticky top-0 z-50 shadow-sm">
      {/* Main header bar */}
      <div className="bg-ink-900 text-white">
        <div className="container-page grid grid-cols-[auto_minmax(0,1fr)_auto] md:grid-cols-[1fr_minmax(0,2fr)_1fr] items-center gap-3 md:gap-6 py-3">

          {/* Logo - Left */}
          <Link
            href="/"
            className="justify-self-start flex-shrink-0 text-3xl font-extrabold tracking-tight text-white hover:text-brand-300 transition-colors"
          >
            sukilo
          </Link>

          {/* Search Bar - Center */}
          <form
            onSubmit={handleSearch}
            className="flex w-full max-w-2xl justify-self-center min-w-0"
          >
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="min-w-0 flex-1 rounded-l-xl border-0 bg-white px-3 md:px-5 py-3 text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />

            <button
              type="submit"
              aria-label="Search"
              className="flex items-center justify-center rounded-r-xl bg-brand-500 px-4 md:px-5 text-white transition-colors hover:bg-brand-600"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                />
              </svg>
            </button>
          </form>

          {/* Account Area - Right */}
          <div className="flex items-center justify-self-end gap-3 md:gap-5">

            {isLoading ? (
              <div className="h-8 w-20 animate-pulse rounded bg-ink-700" />
            ) : user ? (
              <div className="relative" ref={accountRef}>
                <button
                  type="button"
                  onClick={() => setAccountOpen((o) => !o)}
                  aria-expanded={accountOpen}
                  className="flex items-center gap-2 text-sm text-white transition-colors hover:text-brand-300"
                >
                  <svg
                    className="h-6 w-6 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z"
                    />
                  </svg>

                  <span className="hidden lg:inline max-w-[120px] truncate">
                    {user.email_masked || "Account"}
                  </span>

                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {accountOpen && (
                  <div className="absolute right-0 top-full z-50 mt-3 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 text-ink-900 shadow-xl">
                    <Link
                      href="/account"
                      onClick={() => setAccountOpen(false)}
                      className="block px-4 py-2.5 text-sm transition-colors hover:bg-slate-100"
                    >
                      My Account
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setAccountOpen(false)}
                        className="block px-4 py-2.5 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50"
                      >
                        Admin Panel
                      </Link>
                    )}

                    <hr className="my-1 border-slate-200" />

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full px-4 py-2.5 text-left text-sm text-rose-600 transition-colors hover:bg-rose-50"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center gap-2 whitespace-nowrap text-sm text-white transition-colors hover:text-brand-300"
              >
                <svg
                  className="h-6 w-6 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z"
                  />
                </svg>

                <span className="hidden sm:inline">Sign In</span>

                <svg
                  className="hidden h-4 w-4 sm:block"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="m7 10 5 5 5-5"
                  />
                </svg>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className="p-1 text-white transition-colors hover:text-brand-300 sm:hidden"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Category Navigation Bar */}
      <nav className="border-t border-ink-700 bg-ink-800 text-white">
        <div className="container-page">
          <div className="no-scrollbar flex items-center justify-center gap-2 overflow-x-auto py-2">
            <Link
              href="/products"
              className="whitespace-nowrap rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/15"
            >
              All Products
            </Link>

            {[
              "Electronics",
              "Fashion & Apparel",
              "Home & Kitchen",
              "Sports & Outdoors",
              "Beauty & Wellness",
              "Books & Media",
            ].map((cat) => (
              <Link
                key={cat}
                href={`/products?category=${encodeURIComponent(cat)}`}
                className="whitespace-nowrap rounded-full px-4 py-2 text-sm text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="border-b border-slate-200 bg-white shadow-md sm:hidden">
          <nav className="container-page flex flex-col gap-1 py-3">
            <Link
              href="/products"
              className="rounded-lg px-3 py-2.5 text-sm text-ink-700 transition-colors hover:bg-slate-100 hover:text-brand-600"
              onClick={() => setMenuOpen(false)}
            >
              All Products
            </Link>

            {[
              "Electronics",
              "Fashion & Apparel",
              "Home & Kitchen",
              "Sports & Outdoors",
              "Beauty & Wellness",
              "Books & Media",
            ].map((cat) => (
              <Link
                key={cat}
                href={`/products?category=${encodeURIComponent(cat)}`}
                className="rounded-lg px-3 py-2.5 text-sm text-ink-700 transition-colors hover:bg-slate-100 hover:text-brand-600"
                onClick={() => setMenuOpen(false)}
              >
                {cat}
              </Link>
            ))}

            {user ? (
              <>
                <Link
                  href="/account"
                  className="rounded-lg px-3 py-2.5 text-sm text-ink-700 transition-colors hover:bg-slate-100 hover:text-brand-600"
                  onClick={() => setMenuOpen(false)}
                >
                  My Account
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="rounded-lg px-3 py-2.5 text-left text-sm text-rose-600 transition-colors hover:bg-rose-50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="rounded-lg px-3 py-2.5 text-sm text-ink-700 transition-colors hover:bg-slate-100 hover:text-brand-600"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign In
                </Link>

                <Link
                  href="/auth/register"
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50"
                  onClick={() => setMenuOpen(false)}
                >
                  Create Account
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>

  );
}

