"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDown, LogOut, Menu as MenuIcon, Moon, Sun, UserRound } from "lucide-react";
import { cn } from "@/lib/cn";
import { ADMIN_NAV, isActive } from "./nav";

function Avatar({ label, size = "sm" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-brand-600 font-semibold text-white",
        size === "sm" ? "h-8 w-8 text-xs" : "h-9 w-9 text-sm",
      )}
    >
      {label?.[0]?.toUpperCase() ?? "A"}
    </span>
  );
}

/**
 * Top bar: sidebar toggle, current section, theme switch and the account menu.
 * `profile` is the `/me` projection, which only exposes masked identifiers.
 */
export function AdminHeader({ profile, darkMode, sidebarExpanded, onToggleSidebar, onToggleTheme, onSignOut }) {
  const pathname = usePathname();
  const section = ADMIN_NAV.findLast((item) => isActive(pathname, item.href));
  const identity = profile?.email_masked ?? profile?.phone_masked ?? "Administrator";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-ink-200 bg-white px-4 sm:px-6 dark:border-ink-800 dark:bg-ink-900">
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
        aria-controls="admin-sidebar"
        aria-expanded={sidebarExpanded}
        className="focus-ring rounded-lg p-2 text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
      >
        <MenuIcon className="h-6 w-6" strokeWidth={1.8} />
      </button>
      <p className="truncate text-sm font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">
        {section?.label ?? "Admin"}
      </p>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          title={darkMode ? "Light mode" : "Dark mode"}
          className={cn(
            "focus-ring flex h-10 w-10 items-center justify-center rounded-lg border transition-colors",
            darkMode
              ? "border-amber-400/40 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20"
              : "border-ink-200 bg-white text-ink-600 hover:bg-ink-100",
          )}
        >
          {darkMode ? <Sun className="h-5 w-5" strokeWidth={1.8} /> : <Moon className="h-5 w-5" strokeWidth={1.8} />}
        </button>

        <Menu as="div" className="relative">
          <MenuButton className="focus-ring flex items-center gap-2 rounded-lg px-2 py-1.5 text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800">
            <Avatar label={identity} />
            <span className="hidden max-w-40 truncate text-sm font-medium sm:inline">{identity}</span>
            <ChevronDown className="hidden h-4 w-4 text-ink-400 sm:block" />
          </MenuButton>
          <MenuItems
            anchor="bottom end"
            className="z-50 mt-1 w-60 rounded-xl border border-ink-200 bg-white py-1 shadow-xl focus:outline-none dark:border-ink-700 dark:bg-ink-800"
          >
            <div className="flex items-center gap-3 px-4 py-3">
              <Avatar label={identity} size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink-900 dark:text-white">{identity}</p>
                <p className="text-xs text-ink-500 dark:text-ink-400">Signed in</p>
              </div>
            </div>
            <div className="border-t border-ink-100 py-1 dark:border-ink-700">
              <MenuItem>
                <Link
                  href="/account"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-ink-700 data-focus:bg-ink-50 dark:text-ink-200 dark:data-focus:bg-ink-700"
                >
                  <UserRound className="h-4 w-4" />
                  Your account
                </Link>
              </MenuItem>
              <MenuItem>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-rose-600 data-focus:bg-ink-50 dark:text-rose-400 dark:data-focus:bg-ink-700"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </MenuItem>
            </div>
          </MenuItems>
        </Menu>
      </div>
    </header>
  );
}
