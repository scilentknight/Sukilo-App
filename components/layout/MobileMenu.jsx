"use client";

import { useState } from "react";
import Link from "next/link";
import { Dialog, DialogPanel, DialogBackdrop, CloseButton } from "@headlessui/react";
import {
  CloseIcon,
  MenuIcon,
  HomeIcon,
  StoreIcon,
  SparkleIcon,
  UserIcon,
} from "@/components/ui/icons";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import { categoryHref } from "@/lib/search-params";
import { CountrySelector } from "./CountrySelector";
import { CurrencySelector } from "./CurrencySelector";
import { LanguageSelector } from "./LanguageSelector";

/**
 * Mobile slide-over navigation with the category list. Built on Headless UI's
 * Dialog for correct focus trapping and scroll locking.
 */
export function MobileMenu({ categories }) {
  const { t } = useLocale();
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="focus-ring flex h-10 w-10 items-center justify-center rounded-lg text-ink-700 hover:bg-ink-100 lg:hidden"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      <Dialog open={open} onClose={setOpen} className="relative z-[90]">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-ink-900/50 duration-200 data-[closed]:opacity-0"
        />
        <DialogPanel
          transition
          className="fixed inset-y-0 left-0 flex w-[88%] max-w-sm flex-col bg-white shadow-xl duration-200 data-[closed]:-translate-x-4 data-[closed]:opacity-0"
        >
          <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
            <span className="text-lg font-bold text-ink-900">
              Sukilo<span className="text-brand-600">.</span>
            </span>
            <CloseButton
              aria-label="Close menu"
              className="focus-ring flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100"
            >
              <CloseIcon className="h-5 w-5" />
            </CloseButton>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-3">
            <nav aria-label="Mobile" className="space-y-1">
              <MobileLink href="/" icon={<HomeIcon className="h-5 w-5" />}>
                {t("home")}
              </MobileLink>
              <MobileLink href="/product" icon={<SparkleIcon className="h-5 w-5" />}>
                New arrivals
              </MobileLink>
              <MobileLink href="/vendor" icon={<StoreIcon className="h-5 w-5" />}>
                Sell on Sukilo
              </MobileLink>
              <MobileLink
                href={isAuthenticated ? "/account" : "/login"}
                icon={<UserIcon className="h-5 w-5" />}
              >
                {isAuthenticated ? t("account") : "Sign in"}
              </MobileLink>
            </nav>

            <div className="my-3 border-t border-ink-100" />

            <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">
              {t("all_categories")}
            </p>
            <ul className="space-y-0.5">
              {categories.map((category) => (
                <li key={category.name}>
                  <CloseButton
                    as={Link}
                    href={categoryHref(category.name)}
                    className="focus-ring flex items-center justify-between rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-ink-100"
                  >
                    {category.name}
                    <span className="text-xs text-ink-400">{category.count}</span>
                  </CloseButton>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap items-center gap-1 border-t border-ink-100 px-3 py-3">
            <CountrySelector />
            <CurrencySelector />
            <LanguageSelector />
          </div>
        </DialogPanel>
      </Dialog>
    </>
  );
}

function MobileLink({ href, icon, children }) {
  return (
    <CloseButton
      as={Link}
      href={href}
      className="focus-ring flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-800 hover:bg-ink-100"
    >
      <span className="text-ink-400">{icon}</span>
      {children}
    </CloseButton>
  );
}
