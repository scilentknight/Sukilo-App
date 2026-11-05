"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// ─────────────────────────────────────────────────────────────
// Category tree — any depth. Shape: { name, href?, children?: [] }
// Replace with data from your API/DB; if `href` is missing it
// falls back to /products?category=<name>.
// ─────────────────────────────────────────────────────────────
const CATEGORY_TREE = [
  {
    name: "Electronics",
    children: [
      {
        name: "Mobiles & Tablets",
        children: [
          {
            name: "Smartphones",
            children: [
              { name: "Apple" },
              { name: "Samsung" },
              { name: "Xiaomi" },
            ],
          },
          { name: "Tablets" },
          { name: "Mobile Accessories" },
        ],
      },
      {
        name: "Laptops",
        children: [
          { name: "Gaming Laptops" },
          {
            name: "Business Laptops",
            children: [{ name: "Dell" }, { name: "HP" }, { name: "Lenovo" }],
          },
        ],
      },
      {
        name: "Audio",
        children: [{ name: "Headphones" }, { name: "Speakers" }],
      },
    ],
  },
  {
    name: "Fashion & Apparel",
    children: [
      {
        name: "Men",
        children: [
          { name: "Shirts" },
          {
            name: "Footwear",
            children: [{ name: "Sneakers" }, { name: "Formal Shoes" }],
          },
        ],
      },
      { name: "Women", children: [{ name: "Dresses" }, { name: "Bags" }] },
      { name: "Kids" },
    ],
  },
  {
    name: "Home & Kitchen",
    children: [
      { name: "Furniture" },
      {
        name: "Appliances",
        children: [{ name: "Kitchen Appliances" }, { name: "Cleaning" }],
      },
      { name: "Home Decor" },
    ],
  },
  {
    name: "Sports & Outdoors",
    children: [{ name: "Fitness" }, { name: "Camping" }],
  },
  {
    name: "Beauty & Wellness",
    children: [{ name: "Skincare" }, { name: "Haircare" }],
  },
  { name: "Books & Media" },
];

// "All" is just a top-level node whose children are every category
const NAV_ITEMS = [
  { name: "All", href: "/products", children: CATEGORY_TREE },
  ...CATEGORY_TREE,
];

const hrefFor = (node) =>
  node.href || `/products?category=${encodeURIComponent(node.name)}`;

// Each country decides which languages are offered and its default currency.
// The first language in the list is the default.
const COUNTRIES = [
  {
    code: "NP",
    name: "Nepal",
    languages: ["Nepali", "English"],
    currency: "NPR",
  },
  {
    code: "IN",
    name: "India",
    languages: ["Hindi", "English"],
    currency: "INR",
  },
  {
    code: "BD",
    name: "Bangladesh",
    languages: ["Bengali", "English"],
    currency: "BDT",
  },
  {
    code: "LK",
    name: "Sri Lanka",
    languages: ["Sinhala", "Tamil", "English"],
    currency: "LKR",
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    languages: ["Arabic", "English"],
    currency: "AED",
  },
  {
    code: "US",
    name: "United States",
    languages: ["English", "Spanish"],
    currency: "USD",
  },
  {
    code: "GB",
    name: "United Kingdom",
    languages: ["English"],
    currency: "GBP",
  },
  {
    code: "CA",
    name: "Canada",
    languages: ["English", "French"],
    currency: "CAD",
  },
  { code: "AU", name: "Australia", languages: ["English"], currency: "AUD" },
];

const DEFAULT_COUNTRY = "NP";
const STORAGE_KEY = "sukilo_locale";

// Currencies offered for a country: its own first, then a few common ones.
function currenciesFor(country) {
  return [...new Set([country.currency, "USD", "INR", "NPR"])];
}

function defaultsFor(code) {
  const country = COUNTRIES.find((c) => c.code === code) || COUNTRIES[0];
  return {
    country: country.code,
    language: country.languages[0],
    currency: country.currency,
  };
}

// Theme (taken from the reference screenshot)
const TEAL = "bg-[#41c9b4] hover:bg-[#33b8a4]";

function Chevron({ className = "h-4 w-4", dir = "down" }) {
  const d = { down: "m6 9 6 6 6-6", right: "m9 6 6 6-6 6" }[dir];
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const NAV_H = "h-12"; // category bar height (also used by the spacer)

/* Desktop: hover tree. Each node opens its children in a flyout to the right
   (or to the left when `flip` is set, so menus never run off-screen). */
function DesktopNode({ node, depth = 0, flip = false }) {
  const [open, setOpen] = useState(false);
  const hasKids = !!node.children?.length;
  const top = depth === 0;

  return (
    <li
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <Link
        href={hrefFor(node)}
        onClick={() => setOpen(false)}
        className={
          top
            ? `flex items-center gap-1 whitespace-nowrap text-[17px] font-bold transition-colors ${
                open ? "text-[#33b8a4]" : "text-[#222]"
              }`
            : `flex items-center justify-between gap-3 rounded-md px-4 py-3 text-[15px] font-semibold transition-colors ${
                open ? "bg-[#f5f5f5] text-[#33b8a4]" : "text-[#222]"
              }`
        }
      >
        <span>{node.name}</span>
        {hasKids && (
          <Chevron
            dir={top ? "down" : "right"}
            className={`h-4 w-4 shrink-0 transition-transform ${
              top && open ? "rotate-180" : ""
            }`}
          />
        )}
      </Link>

      {hasKids && open && (
        // The padding (pt-2 / pl-2) keeps the hover alive across the gap
        <div
          className={`absolute z-30 ${
            top
              ? `top-full pt-3 ${flip ? "right-0" : "left-0"}`
              : `top-0 ${flip ? "right-full pr-2" : "left-full pl-2"}`
          }`}
        >
          <ul className="w-64 rounded-lg border border-[#e5e5e5] bg-white p-1.5 shadow-lg">
            {node.children.map((child) => (
              <DesktopNode
                key={child.name}
                node={child}
                depth={depth + 1}
                flip={flip}
              />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

/* Mobile: accordion tree inside the drawer */
function MobileNode({ node, depth = 0, onNavigate }) {
  const [open, setOpen] = useState(false);
  const hasKids = !!node.children?.length;

  return (
    <li>
      <div
        className="flex items-center justify-between"
        style={{ paddingLeft: depth * 16 }}
      >
        <Link
          href={hrefFor(node)}
          onClick={onNavigate}
          className={`flex-1 py-3 text-[15px] ${
            depth === 0 ? "font-bold" : "font-medium"
          } text-[#222]`}
        >
          {node.name}
        </Link>
        {hasKids && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={`Toggle ${node.name}`}
            className="p-3 text-[#6b6b6b]"
          >
            <Chevron
              className={`h-5 w-5 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>
      {hasKids && open && (
        <ul>
          {node.children.map((child) => (
            <MobileNode
              key={child.name}
              node={child}
              depth={depth + 1}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function Header() {
  const { user, isAdmin, signOut, isLoading } = useAuth();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [locale, setLocale] = useState(() => defaultsFor(DEFAULT_COUNTRY));
  // "account" | "location" | null
  const [openMenu, setOpenMenu] = useState(null);
  const [navHidden, setNavHidden] = useState(false); // category bar visibility
  const [drawerOpen, setDrawerOpen] = useState(false); // mobile category drawer

  // Category bar: hide on scroll down, show on scroll up and when back at the top
  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = Math.max(window.scrollY, 0);
        const delta = y - last;

        if (y <= 8) {
          setNavHidden(false);
          last = y;
        } else if (delta > 6) {
          setNavHidden(true);
          setOpenMenu(null);
          last = y;
        } else if (delta < -6) {
          setNavHidden(false);
          last = y;
        }
        ticking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock page scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  // Close any dropdown when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (!e.target.closest("[data-dropdown]")) setOpenMenu(null);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Load saved country / language / currency (after mount to avoid hydration mismatch)
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved?.country) setLocale(saved);
    } catch {}
  }, []);

  function updateLocale(next) {
    setLocale(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
    // Let other components (prices, i18n) react to the change
    window.dispatchEvent(new CustomEvent("sukilo:locale", { detail: next }));
  }

  // Changing the country resets language + currency to that country's defaults
  const changeCountry = (code) => updateLocale(defaultsFor(code));

  const currentCountry =
    COUNTRIES.find((c) => c.code === locale.country) || COUNTRIES[0];

  const toggle = (name) => setOpenMenu((m) => (m === name ? null : name));

  function handleSearch(e) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  }

  async function handleSignOut() {
    setOpenMenu(null);
    await signOut();
    router.push("/");
  }

  const dropdownPanel =
    "absolute top-full z-50 mt-2 overflow-hidden rounded-lg border border-[#e5e5e5] bg-white py-1.5 text-[#222] shadow-lg";
  const dropdownItem =
    "block w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#f5f5f5]";

  return (
    <>
      <header className="sticky top-0 z-50 font-sans text-[#222]">
        {/* ───────── Row 1 (always visible): logo · search · location · login ───────── */}
        <div className="relative z-20 border-b border-[#e5e5e5] bg-white">
          <div className="container-page flex flex-wrap items-center gap-x-4 gap-y-3 py-3 md:flex-nowrap md:gap-x-8 md:py-2">
            {/* Logo */}
            <Link href="/" className="order-1 shrink-0">
              {/* Use a logo variant that is readable on a WHITE background */}
              <Image
                src="/sukilo-logo-horizontal.png"
                alt="Sukilo"
                width={616}
                height={260}
                priority
                className="h-7 w-auto sm:h-8 md:h-10"
              />
            </Link>

            {/* Search (full-width second line on mobile) */}
            <form
              onSubmit={handleSearch}
              role="search"
              className="order-3 flex h-11 w-full min-w-0 items-center rounded-md bg-[#f5f5f5] px-4 transition-shadow focus-within:ring-2 focus-within:ring-[#41c9b4] md:order-2 md:h-12 md:flex-1"
            >
              <button
                type="submit"
                aria-label="Search"
                className="mr-3 shrink-0 text-[#6b6b6b] transition-colors hover:text-[#222]"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                  />
                </svg>
              </button>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, brands & more"
                className="min-w-0 flex-1 border-0 bg-transparent text-[15px] text-[#222] placeholder:text-[#8a8a8a] outline-none ring-0 focus:outline-none focus:ring-0 md:text-base"
              />
            </form>

            {/* Right side: location + account */}
            <div className="order-2 ml-auto flex items-center gap-3 md:order-3 md:ml-0 md:gap-6">
              {/* Country / Language / Currency */}
              <div
                className="relative"
                data-dropdown
                onMouseEnter={() => setOpenMenu("location")}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <button
                  type="button"
                  onClick={() => toggle("location")}
                  aria-expanded={openMenu === "location"}
                  aria-label="Change country, language and currency"
                  className="flex items-center gap-1.5 text-[#222] transition-colors hover:text-[#33b8a4] md:text-[17px]"
                >
                  <svg
                    className="h-6 w-6 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.6}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z"
                    />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                  <span className="hidden md:inline">
                    {currentCountry.name}
                  </span>
                  <span className="text-sm font-semibold md:hidden">
                    {currentCountry.code}
                  </span>
                  <Chevron />
                </button>

                {openMenu === "location" && (
                  <div
                    className={`${dropdownPanel} left-1/2 w-72 max-w-[calc(100vw-2rem)] -translate-x-1/2 space-y-3 p-4`}
                  >
                    {[
                      {
                        label: "Country",
                        value: locale.country,
                        onChange: (v) => changeCountry(v),
                        options: COUNTRIES.map((c) => ({
                          value: c.code,
                          label: c.name,
                        })),
                      },
                      {
                        label: "Language",
                        value: locale.language,
                        onChange: (v) =>
                          updateLocale({ ...locale, language: v }),
                        options: currentCountry.languages.map((l) => ({
                          value: l,
                          label: l,
                        })),
                      },
                      {
                        label: "Currency",
                        value: locale.currency,
                        onChange: (v) =>
                          updateLocale({ ...locale, currency: v }),
                        options: currenciesFor(currentCountry).map((c) => ({
                          value: c,
                          label: c,
                        })),
                      },
                    ].map((f) => (
                      <label key={f.label} className="block">
                        <span className="mb-1 block text-xs font-semibold text-[#6b6b6b]">
                          {f.label}
                        </span>
                        <select
                          value={f.value}
                          onChange={(e) => f.onChange(e.target.value)}
                          className="h-10 w-full rounded-md border border-[#e5e5e5] bg-[#f5f5f5] px-3 text-sm text-[#222] outline-none focus:ring-2 focus:ring-[#41c9b4]"
                        >
                          {f.options.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))}

                    <button
                      type="button"
                      onClick={() => setOpenMenu(null)}
                      className={`h-10 w-full rounded-md text-sm font-medium text-white transition-colors ${TEAL}`}
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>

              {/* Account */}
              {isLoading ? (
                <div className="h-10 w-20 animate-pulse rounded-md bg-[#f0f0f0] md:h-12 md:w-28" />
              ) : user ? (
                <div className="relative" data-dropdown>
                  <button
                    type="button"
                    onClick={() => toggle("account")}
                    aria-expanded={openMenu === "account"}
                    className={`flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-white transition-colors md:h-12 md:px-5 md:text-base ${TEAL}`}
                  >
                    <svg
                      className="h-5 w-5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.6}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z"
                      />
                    </svg>
                    <span className="hidden max-w-[120px] truncate sm:inline">
                      {user.email_masked || "Account"}
                    </span>
                    <Chevron />
                  </button>

                  {openMenu === "account" && (
                    <div className={`${dropdownPanel} right-0 w-52`}>
                      <Link
                        href="/account"
                        onClick={() => setOpenMenu(null)}
                        className={dropdownItem}
                      >
                        My Account
                      </Link>
                      <Link
                        href="/vendor/apply"
                        onClick={() => setOpenMenu(null)}
                        className={dropdownItem}
                      >
                        Sell on Sukilo
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setOpenMenu(null)}
                          className={`${dropdownItem} font-medium text-[#33b8a4]`}
                        >
                          Admin Panel
                        </Link>
                      )}
                      <hr className="my-1 border-[#e5e5e5]" />
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className={`${dropdownItem} text-rose-600 hover:bg-rose-50`}
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className={`flex h-6 items-center rounded px-2 text-sm font-medium text-white transition-colors md:h-8 md:px-9 md:text-sm ${TEAL}`}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ───────── Row 2: category tree (hides on scroll down) ─────────
          Positioned under row 1 so showing/hiding never shifts the page. */}
        <nav
          aria-label="Categories"
          aria-hidden={navHidden}
          className={`absolute inset-x-0 top-full z-10 ${NAV_H} border-b border-[#e5e5e5] bg-white shadow-sm transition-[transform,visibility] duration-300 ${
            navHidden ? "invisible -translate-y-full" : "visible translate-y-0"
          }`}
        >
          <div className="container-page flex h-full items-center">
            {/* Desktop: hover dropdowns, evenly spread */}
            <ul className="hidden w-full items-center justify-between lg:flex">
              {NAV_ITEMS.map((node, i) => (
                <DesktopNode
                  key={node.name}
                  node={node}
                  flip={i >= NAV_ITEMS.length - 2}
                />
              ))}
            </ul>

            {/* Mobile / tablet: categories button + quick links */}
            <div className="flex min-w-0 flex-1 items-center gap-4 lg:hidden">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="flex shrink-0 items-center gap-2 text-[15px] font-bold text-[#222]"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                Categories
              </button>
              <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-5 overflow-x-auto">
                {CATEGORY_TREE.map((node) => (
                  <Link
                    key={node.name}
                    href={hrefFor(node)}
                    className="whitespace-nowrap text-[15px] font-bold text-[#222]"
                  >
                    {node.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Reserves the space the absolutely-positioned category bar occupies */}
      <div aria-hidden="true" className={NAV_H} />

      {/* Mobile category drawer (accordion tree) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-white font-sans lg:hidden">
          <div className="flex items-center justify-between border-b border-[#e5e5e5] px-4 py-3">
            <span className="text-lg font-bold text-[#222]">Categories</span>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close categories"
              className="p-1 text-[#222]"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <ul className="flex-1 overflow-y-auto px-4 py-2">
            <MobileNode
              node={{ name: "All Products", href: "/products" }}
              onNavigate={() => setDrawerOpen(false)}
            />
            {CATEGORY_TREE.map((node) => (
              <MobileNode
                key={node.name}
                node={node}
                onNavigate={() => setDrawerOpen(false)}
              />
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
