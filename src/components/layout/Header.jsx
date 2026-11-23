"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// ─────────────────────────────────────────────────────────────
// Category tree
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

const NAV_ITEMS = [
  { name: "All Categories", href: "/categories", children: CATEGORY_TREE },
  ...CATEGORY_TREE,
];

const hrefFor = (node) =>
  node.href || `/products?category=${encodeURIComponent(node.name)}`;

// ─────────────────────────────────────────────────────────────
// Country, language and currency settings
// ─────────────────────────────────────────────────────────────
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
  {
    code: "AU",
    name: "Australia",
    languages: ["English"],
    currency: "AUD",
  },
];

const DEFAULT_COUNTRY = "NP";
const STORAGE_KEY = "sukilo_locale";
const ANNOUNCEMENT_STORAGE_KEY = "sukilo_announcement_closed";

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

const NAV_H = "h-12";

// ─────────────────────────────────────────────────────────────
// Desktop category dropdown
// ─────────────────────────────────────────────────────────────
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
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      <Link
        href={hrefFor(node)}
        onClick={() => setOpen(false)}
        className={
          top
            ? `flex items-center gap-1 whitespace-nowrap rounded-md px-3 py-3 text-[17px] font-semibold transition-colors ${
                open
                  ? "bg-gray-100 text-[#33b8a4] dark:bg-gray-700 dark:text-[#41c9b4]"
                  : "text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700"
              }`
            : `flex items-center justify-between gap-3 rounded-md px-4 py-3 text-[15px] font-semibold transition-colors ${
                open
                  ? "bg-gray-100 text-[#33b8a4] dark:bg-gray-700 dark:text-[#41c9b4]"
                  : "text-gray-800 dark:text-gray-100"
              } hover:bg-gray-100 dark:hover:bg-gray-700`
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
        <div
          className={`absolute z-30 ${
            top
              ? `top-full pt-3 ${flip ? "right-0" : "left-0"}`
              : `top-0 ${flip ? "right-full pr-2" : "left-full pl-2"}`
          }`}
        >
          <ul className="w-64 rounded-lg border border-gray-200 bg-white p-1.5 shadow-lg dark:border-gray-700 dark:bg-gray-800">
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

// ─────────────────────────────────────────────────────────────
// Mobile category accordion
// ─────────────────────────────────────────────────────────────
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
          } text-gray-800 dark:text-gray-100`}
        >
          {node.name}
        </Link>

        {hasKids && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={`Toggle ${node.name}`}
            className="p-3 text-gray-600 dark:text-gray-300"
          >
            <Chevron
              className={`h-5 w-5 transition-transform ${
                open ? "rotate-180" : ""
              }`}
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

// ─────────────────────────────────────────────────────────────
// Main Header
// ─────────────────────────────────────────────────────────────
export default function Header() {
  const { user, isAdmin, signOut } = useAuth();
  const router = useRouter();

  const imageInputRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [locale, setLocale] = useState(() => defaultsFor(DEFAULT_COUNTRY));

  const [announcementVisible, setAnnouncementVisible] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [theme, setTheme] = useState("light");

  const [openMenu, setOpenMenu] = useState(null);
  const [navHidden, setNavHidden] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Restore announcement visibility for this tab
  useEffect(() => {
    const isClosed = sessionStorage.getItem(ANNOUNCEMENT_STORAGE_KEY);

    setAnnouncementVisible(isClosed !== "true");
  }, []);

  // Restore saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("sukilo_theme") || "light";

    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  function changeTheme(nextTheme) {
    setTheme(nextTheme);

    document.documentElement.classList.toggle("dark", nextTheme === "dark");

    localStorage.setItem("sukilo_theme", nextTheme);
    setThemeMenuOpen(false);
  }

  // Category bar visibility on scroll
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

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Lock page scroll while mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (!e.target.closest("[data-dropdown]")) {
        setOpenMenu(null);
        setThemeMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  // Restore saved locale
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");

      if (saved?.country) {
        setLocale(saved);
      }
    } catch {}
  }, []);

  function updateLocale(next) {
    setLocale(next);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}

    window.dispatchEvent(new CustomEvent("sukilo:locale", { detail: next }));
  }

  const changeCountry = (code) => {
    updateLocale(defaultsFor(code));
  };

  const currentCountry =
    COUNTRIES.find((c) => c.code === locale.country) || COUNTRIES[0];

  const toggle = (name) => {
    setOpenMenu((m) => (m === name ? null : name));
  };

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

  // Shared dropdown styles
  const dropdownPanel =
    "absolute top-full z-50 mt-2 overflow-hidden rounded-lg border border-gray-200 bg-white py-1.5 text-gray-900 shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";

  const dropdownItem =
    "block w-full px-4 py-2.5 text-left text-sm text-gray-800 transition-colors hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700";

  return (
    <>
      {/* Announcement Bar */}
      {announcementVisible && (
        <div className="relative flex h-8 items-center justify-between bg-[#41c9b4] px-4 text-white sm:px-6">
          <div className="flex items-center gap-3 text-sm font-medium">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-lg">✦</span>
              <span className="hidden sm:inline">Welcome to Sukilo</span>
              <span className="sm:hidden">Welcome to Sukilo</span>
            </Link>

            <span className="hidden text-white/50 sm:block">|</span>

            <Link
              href="/vendor/apply"
              className="font-semibold transition hover:text-purple-200"
            >
              Sell on Sukilo
            </Link>
          </div>

          <button
            type="button"
            onClick={() => {
              setAnnouncementVisible(false);
              sessionStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, "true");
            }}
            aria-label="Close announcement"
            className="flex h-6 w-6 items-center justify-center rounded transition hover:bg-white/15"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 6l12 12M18 6L6 18"
              />
            </svg>
          </button>
        </div>
      )}

      <header className="sticky top-0 z-50 font-sans text-gray-900 dark:text-gray-100">
        {/* ───────── Row 1: Logo, Search, Actions ───────── */}
        <div className="relative z-20 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          <div className="container-page flex flex-wrap items-center gap-x-4 gap-y-3 py-3 md:flex-nowrap md:gap-x-8 md:py-2">
            {/* Logo */}
            <Link href="/" className="order-1 shrink-0">
              <Image
                src="/sukilo-logo-horizontal.png"
                alt="Sukilo"
                width={616}
                height={260}
                priority
                className="h-7 w-auto sm:h-8 md:h-10"
              />
            </Link>

            {/* Search */}
            {/* <form
              onSubmit={handleSearch}
              role="search"
              className="order-3 flex h-11 w-full min-w-0 items-center rounded-md border border-gray-200 bg-white px-4 transition-all focus-within:border-[#41c9b4] focus-within:ring-1 focus-within:ring-[#41c9b4]/20 dark:border-gray-700 dark:bg-gray-800 md:order-2 md:h-12 md:flex-1"
            >
              <button
                type="submit"
                aria-label="Search"
                className="mr-3 shrink-0 text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
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
                className="min-w-0 flex-1 border-0 bg-transparent text-[15px] text-gray-900 placeholder:text-gray-500 outline-none ring-0 focus:outline-none focus:ring-0 dark:text-gray-100 dark:placeholder:text-gray-400 md:text-base"
              />
            </form> */}

            {/* Search */}
            <form
              onSubmit={handleSearch}
              role="search"
              className="order-3 flex h-11 w-full min-w-0 items-center rounded-md border border-gray-200 bg-white px-3 transition-all focus-within:border-[#41c9b4] focus-within:ring-1 focus-within:ring-[#41c9b4]/20 dark:border-gray-700 dark:bg-gray-800 md:order-2 md:h-12 md:flex-1"
            >
              {/* Search Icon */}
              <button
                type="submit"
                aria-label="Search"
                className="mr-3 shrink-0 text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
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

              {/* Search Input */}
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands & more"
                className="min-w-0 flex-1 border-0 bg-transparent text-[15px] text-gray-900 placeholder:text-gray-500 outline-none ring-0 focus:outline-none focus:ring-0 dark:text-gray-100 dark:placeholder:text-gray-400 md:text-base"
              />

              {/* Hidden image input */}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  if (file) {
                    console.log("Selected image for visual search:", file);

                    // Visual search API integration will go here.
                  }

                  // Allow selecting the same image again
                  e.target.value = "";
                }}
              />

              {/* Camera / Visual Search Button */}
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                aria-label="Search by image"
                title="Search by image"
                className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-[#41c9b4] dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-[#41c9b4]"
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
                    d="M4 7h3l2-2h6l2 2h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z"
                  />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </button>
            </form>

            {/* Right Side */}
            <div className="order-2 ml-auto flex items-center gap-2 sm:gap-3 md:order-3 md:ml-0 md:gap-4">
              {/* Wishlist */}
              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="relative flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition hover:bg-purple-50 hover:text-purple-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-purple-400"
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
                    d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8z"
                  />
                </svg>
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                aria-label="Shopping cart"
                className="relative flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition hover:bg-purple-50 hover:text-purple-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-purple-400"
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
                    d="M3 3h2l2.4 12.1a2 2 0 0 0 2 1.6h9.2a2 2 0 0 0 2-1.6L22 8H6"
                  />
                  <circle cx="10" cy="20" r="1.5" />
                  <circle cx="18" cy="20" r="1.5" />
                </svg>
              </Link>

              {/* Theme Dropdown */}
              <div className="relative" data-dropdown>
                <button
                  type="button"
                  onClick={() => setThemeMenuOpen((open) => !open)}
                  aria-label="Change theme"
                  aria-expanded={themeMenuOpen}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition hover:bg-purple-50 hover:text-purple-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-purple-400"
                >
                  {theme === "light" ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="4" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3l1.42 1.42M2 12h2m16 0h2M4.93 19.07l-1.42 1.42m11.3-11.3l1.42-1.42"
                      />
                    </svg>
                  ) : (
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
                        d="M20.9 13A8.5 8.5 0 0 1 11 3.1a8.5 8.5 0 1 0 9.9 9.9z"
                      />
                    </svg>
                  )}
                </button>

                {themeMenuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 text-gray-900 shadow-xl dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
                    <button
                      type="button"
                      onClick={() => changeTheme("light")}
                      className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-700"
                    >
                      <span className="flex items-center gap-3">
                        <svg
                          className="h-5 w-5 text-gray-500 dark:text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.8}
                          viewBox="0 0 24 24"
                        >
                          <circle cx="12" cy="12" r="4" />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3l1.42 1.42M2 12h2m16 0h2"
                          />
                        </svg>
                        Light
                      </span>

                      {theme === "light" && (
                        <svg
                          className="h-5 w-5 text-purple-600 dark:text-purple-400"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m5 12 4 4L19 6"
                          />
                        </svg>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => changeTheme("dark")}
                      className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-700"
                    >
                      <span className="flex items-center gap-3">
                        <svg
                          className="h-5 w-5 text-gray-500 dark:text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.8}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M20.9 13A8.5 8.5 0 0 1 11 3.1a8.5 8.5 0 1 0 9.9 9.9z"
                          />
                        </svg>
                        Dark
                      </span>

                      {theme === "dark" && (
                        <svg
                          className="h-5 w-5 text-purple-600 dark:text-purple-400"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m5 12 4 4L19 6"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Country / Language / Currency */}
              <div
                className="relative hidden sm:block"
                data-dropdown
                onMouseEnter={() => setOpenMenu("location")}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <button
                  type="button"
                  onClick={() => toggle("location")}
                  aria-expanded={openMenu === "location"}
                  aria-label="Change country, language and currency"
                  className="flex items-center gap-1 text-sm text-gray-800 transition-colors hover:text-purple-700 dark:text-gray-100 dark:hover:text-purple-400"
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
                      d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z"
                    />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>

                  <span className="hidden xl:inline">
                    {currentCountry.name}
                  </span>

                  <span className="text-sm font-semibold lg:hidden">
                    {currentCountry.code}
                  </span>

                  <Chevron />
                </button>

                {openMenu === "location" && (
                  <div
                    className={`${dropdownPanel} right-0 w-72 space-y-3 p-4`}
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
                        <span className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">
                          {f.label}
                        </span>

                        <select
                          value={f.value}
                          onChange={(e) => f.onChange(e.target.value)}
                          className="h-10 w-full rounded-md border border-gray-200 bg-gray-100 px-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100"
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
                      className="h-10 w-full rounded-md bg-purple-600 text-sm font-medium text-white transition hover:bg-purple-700"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>

              {/* Authentication */}
              {user ? (
                <div className="relative" data-dropdown>
                  <button
                    type="button"
                    onClick={() => toggle("account")}
                    aria-expanded={openMenu === "account"}
                    className="flex h-10 items-center gap-2 rounded-md bg-purple-600 px-3 text-sm font-medium text-white transition-colors hover:bg-purple-700 md:px-4 md:text-base"
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
                          className={`${dropdownItem} font-medium text-purple-600 dark:text-purple-400`}
                        >
                          Admin Panel
                        </Link>
                      )}

                      <hr className="my-1 border-gray-200 dark:border-gray-700" />

                      <button
                        type="button"
                        onClick={handleSignOut}
                        className={`${dropdownItem} text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950`}
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 sm:gap-2">
                  <Link
                    href="/auth/login"
                    className="hidden h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-gray-800 transition hover:text-purple-700 dark:text-gray-100 dark:hover:text-purple-400 sm:flex md:px-4 md:text-base"
                  >
                    Sign in
                  </Link>

                  <Link
                    href="/auth/register"
                    className={`flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium text-white transition-colors ${TEAL}`}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ───────── Row 2: Category navigation ───────── */}
        <nav
          aria-label="Categories"
          aria-hidden={navHidden}
          className={`absolute inset-x-0 top-full z-10 ${NAV_H} border-b border-gray-200 bg-white shadow-sm transition-[transform,visibility] duration-300 dark:border-gray-700 dark:bg-gray-900 ${
            navHidden ? "invisible -translate-y-full" : "visible translate-y-0"
          }`}
        >
          <div className="container-page flex h-full items-center">
            {/* Desktop category navigation */}
            <ul className="hidden w-full items-center justify-between lg:flex">
              {NAV_ITEMS.map((node, i) => (
                <DesktopNode
                  key={node.name}
                  node={node}
                  flip={i >= NAV_ITEMS.length - 2}
                />
              ))}
            </ul>

            {/* Mobile / tablet category navigation */}
            <div className="flex min-w-0 flex-1 items-center gap-4 lg:hidden">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="flex shrink-0 items-center gap-2 text-[15px] font-bold text-gray-800 dark:text-gray-100"
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
                    className="whitespace-nowrap text-[15px] font-bold text-gray-800 dark:text-gray-100"
                  >
                    {node.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Spacer for the category bar */}
      <div aria-hidden="true" className={NAV_H} />

      {/* ───────── Mobile category drawer ───────── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-white font-sans dark:bg-gray-900 lg:hidden">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Categories
            </span>

            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close categories"
              className="p-1 text-gray-800 dark:text-gray-100"
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
