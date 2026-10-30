"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { LoadingSpinner } from "@/components/ui";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "📊", exact: true },
  { href: "/admin/products", label: "Products", icon: "📦" },
  { href: "/admin/users", label: "Users", icon: "👥" },
];

export default function AdminLayout({ children }) {
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.push("/auth/login"); return; }
    if (!isAdmin) { router.push("/account"); }
  }, [user, isAdmin, isLoading, router]);

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  if (isLoading) return <LoadingSpinner message="Loading admin panel…" />;
  if (!user || !isAdmin) return null;

  return (
    <div className="dark min-h-screen bg-ink-900 flex">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-ink-800 flex flex-col border-r border-ink-700">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-ink-700">
          <Link href="/" className="text-xl font-black text-white tracking-tight">
            sukilo
          </Link>
          <p className="text-xs text-ink-400 mt-0.5">Admin Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
          {NAV_ITEMS.map(({ href, label, icon, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-600 text-white"
                    : "text-ink-300 hover:bg-ink-700 hover:text-white"
                }`}
              >
                <span>{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-2 py-4 border-t border-ink-700">
          <Link
            href="/account"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-ink-400 hover:text-white hover:bg-ink-700 transition-colors"
          >
            <span>👤</span>
            {user.email_masked || "Account"}
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-rose-400 hover:text-rose-300 hover:bg-ink-700 transition-colors mt-1"
          >
            <span>🚪</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-ink-800 border-b border-ink-700 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <h1 className="text-sm font-semibold text-ink-300">
            {NAV_ITEMS.find(({ href, exact }) =>
              exact ? pathname === href : pathname.startsWith(href)
            )?.label ?? "Admin"}
          </h1>
          <Link href="/" className="text-xs text-ink-400 hover:text-white transition-colors">
            ← View site
          </Link>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

