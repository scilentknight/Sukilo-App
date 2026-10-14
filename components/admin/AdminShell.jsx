"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/context/AuthContext";
import { getProfile } from "@/lib/account";
import { cn } from "@/lib/cn";
import { usePersistentStore } from "@/lib/persistent-store";
import { loginHref, signOutLocally } from "@/components/account/AccountShell";
import { useAccountResource } from "@/components/account/useAccountResource";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";
import { adminThemeStore } from "./theme";

const DESKTOP = "(min-width: 1024px)";

function subscribeDesktop(onChange) {
  const query = window.matchMedia(DESKTOP);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useIsDesktop() {
  return useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia(DESKTOP).matches,
    () => true,
  );
}

/**
 * Admin frame (sidebar, header, content). Visitors are sent to log in; what a
 * signed-in user may see or change is decided by the API on each request.
 */
export function AdminShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useAuth();
  const profile = useAccountResource(getProfile);
  const darkMode = usePersistentStore(adminThemeStore) === "dark";
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [exitHref, setExitHref] = useState(null);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    if (status === "anonymous") router.replace(exitHref ?? loginHref(pathname));
  }, [status, router, pathname, exitHref]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (event) => event.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const toggleSidebar = () => {
    if (isDesktop) setCollapsed((c) => !c);
    else setMobileOpen((open) => !open);
  };

  const signOut = () => {
    setExitHref("/admin/login");
    signOutLocally();
  };

  return (
    <div className={cn("min-h-screen w-full bg-ink-100 dark:bg-slate-950", darkMode && "dark")}>
      <AdminSidebar collapsed={collapsed} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className={cn("min-h-screen transition-[padding] duration-200", collapsed ? "lg:pl-20" : "lg:pl-64")}>
        <AdminHeader
          profile={profile.data}
          darkMode={darkMode}
          sidebarExpanded={isDesktop ? !collapsed : mobileOpen}
          onToggleSidebar={toggleSidebar}
          onToggleTheme={() => adminThemeStore.set(darkMode ? "light" : "dark")}
          onSignOut={signOut}
        />
        <main className="p-4 sm:p-6 lg:p-8">
          {status === "authenticated" ? (
            children
          ) : (
            <div className="space-y-4" role="status" aria-label="Loading">
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-72 w-full" />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
