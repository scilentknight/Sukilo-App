"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import AdminFooter from "./AdminFooter";
import { findNavItem } from "@/lib/nav";

const STORAGE_KEY = "sukilo_admin_sidebar_collapsed";

/** Shared frame for every admin page: sidebar, header, content, footer. */
export default function AdminShell({ children }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- storage is only readable after mount
      setCollapsed(window.localStorage.getItem(STORAGE_KEY) === "true");
    } catch {
      /* Storage can be unavailable in private windows. */
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  function toggleCollapsed() {
    setCollapsed((value) => {
      const next = !value;
      try {
        window.localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        /* Ignore storage failures; the layout still works. */
      }
      return next;
    });
  }

  const title = findNavItem(pathname)?.label ?? "Admin";

  return (
    <div className="flex min-h-screen bg-ink-50">
      <AdminSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onNavigate={() => setMobileOpen(false)}
      />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <AdminHeader
          title={title}
          collapsed={collapsed}
          onToggleCollapse={toggleCollapsed}
          onOpenMobile={() => setMobileOpen(true)}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
        <AdminFooter />
      </div>
    </div>
  );
}
