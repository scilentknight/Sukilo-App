"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { ADMIN_NAV, isActive } from "./nav";

/**
 * Fixed navigation rail. On desktop it collapses to icons; below `lg` it is an
 * off-canvas drawer. It stays dark in both colour schemes.
 */
export function AdminSidebar({ collapsed, mobileOpen, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen ? (
        <div aria-hidden className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
      ) : null}

      <aside
        id="admin-sidebar"
        aria-label="Admin navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col overflow-hidden bg-ink-900 transition-[width,transform] duration-200 lg:translate-x-0",
          collapsed ? "lg:w-20" : "lg:w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div
          className={cn(
            "flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-5",
            collapsed && "lg:justify-center lg:px-0",
          )}
        >
          <Link href="/admin" className="focus-ring flex min-w-0 items-center gap-3 rounded-lg" onClick={onClose}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
              S
            </span>
            <span className={cn("min-w-0", collapsed && "lg:hidden")}>
              <span className="block truncate text-sm font-bold leading-tight text-white">Sukilo</span>
              <span className="block text-[11px] uppercase tracking-wide text-ink-400">Admin panel</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="focus-ring ml-auto rounded-lg p-1.5 text-ink-400 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden p-3 text-sm font-medium">
          {ADMIN_NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                aria-current={active ? "page" : undefined}
                onClick={onClose}
                className={cn(
                  "focus-ring flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                  collapsed && "lg:justify-center lg:px-0",
                  active ? "bg-brand-600 text-white" : "text-ink-300 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" strokeWidth={1.8} />
                <span className={cn("whitespace-nowrap", collapsed && "lg:hidden")}>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={cn("border-t border-white/10 p-3", collapsed && "lg:hidden")}>
          <Link
            href="/"
            className="focus-ring block rounded-lg px-3 py-2 text-xs text-ink-400 hover:bg-white/10 hover:text-white"
          >
            View storefront
          </Link>
        </div>
      </aside>
    </>
  );
}
