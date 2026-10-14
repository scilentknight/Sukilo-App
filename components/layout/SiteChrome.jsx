"use client";

import { usePathname } from "next/navigation";

/** Storefront header and footer around every page except the admin panel, which has its own shell. */
export function SiteChrome({ header, footer, children }) {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return children;
  return (
    <>
      {header}
      <main className="flex-1">{children}</main>
      {footer}
    </>
  );
}
