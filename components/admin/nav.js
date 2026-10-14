import {
  FolderTree,
  Images,
  LayoutDashboard,
  Package,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  TicketPercent,
  Users,
} from "lucide-react";

/**
 * Admin sidebar entries. Sections with a `description` are not built yet and
 * render the placeholder page at `app/admin/[section]`; dashboard and access
 * have their own routes.
 */
export const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: ShoppingBag,
    description: "Review, fulfil, refund and track customer orders across every market.",
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: Package,
    description: "Moderate vendor listings, pricing, stock and product media.",
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: FolderTree,
    description: "Organise the category tree shown in the storefront menus.",
  },
  {
    href: "/admin/vendors",
    label: "Vendors",
    icon: Store,
    description: "Approve seller applications and manage vendor accounts and payouts.",
  },
  {
    href: "/admin/customers",
    label: "Customers",
    icon: Users,
    description: "Look up customer accounts, orders and support history.",
  },
  {
    href: "/admin/reviews",
    label: "Reviews",
    icon: Star,
    description: "Moderate product and vendor reviews.",
  },
  {
    href: "/admin/coupons",
    label: "Coupons",
    icon: TicketPercent,
    description: "Create and schedule discount codes per market.",
  },
  {
    href: "/admin/banners",
    label: "Home banners",
    icon: Images,
    description: "Manage the hero banners and promotions on the home page.",
  },
  { href: "/admin/access", label: "Access control", icon: ShieldCheck },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: Settings,
    description: "Marketplace settings such as markets, currencies and shipping rules.",
  },
];

/** Sections that still render the placeholder page, keyed by URL segment. */
export const PLANNED_SECTIONS = Object.fromEntries(
  ADMIN_NAV.filter((item) => item.description).map((item) => [item.href.split("/").pop(), item]),
);

export function isActive(pathname, href) {
  return pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`));
}
