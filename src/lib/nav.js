import {
  BadgeCheck,
  BadgePercent,
  ClipboardCheck,
  LayoutDashboard,
  PackageSearch,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Store,
  Tags,
  Users,
} from "lucide-react";

/** Sidebar layout for the admin panel. Every item maps to a backend feature. */
export const ADMIN_NAV = [
  {
    title: null,
    items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true }],
  },
  {
    title: "People",
    items: [
      { label: "Customers", href: "/admin/customers", icon: Users },
      { label: "Vendors", href: "/admin/vendors", icon: Store },
      { label: "Applications", href: "/admin/applications", icon: ClipboardCheck },
    ],
  },
  {
    title: "Catalog",
    items: [
      { label: "Categories", href: "/admin/catalog/categories", icon: Tags },
      { label: "Brands", href: "/admin/catalog/brands", icon: BadgeCheck },
      { label: "Products", href: "/admin/catalog/products", icon: PackageSearch },
      { label: "Offers", href: "/admin/catalog/offers", icon: BadgePercent },
    ],
  },
  {
    title: "Manage",
    items: [
      { label: "Storefront Products", href: "/admin/products", icon: ShoppingBag },
      { label: "Access & Roles", href: "/admin/access", icon: ShieldCheck },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

/** Return the sidebar item that best matches the current path. */
export function findNavItem(pathname) {
  const items = ADMIN_NAV.flatMap((group) => group.items);
  const match = items
    .filter(({ href, exact }) => (exact ? pathname === href : pathname.startsWith(href)))
    .sort((a, b) => b.href.length - a.href.length)[0];
  return match ?? null;
}
