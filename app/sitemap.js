import { listCategories } from "@/lib/products";
import { categoryHref } from "@/lib/search-params";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Dynamic sitemap: the static routes plus one listing page per category. Product
 * pages are discovered through those listings rather than enumerated here.
 */
export default async function sitemap() {
  const now = new Date();

  const staticRoutes = ["", "/product", "/visual-search", "/barcode-search"].map((path) => ({
    url: `${SITE}${path}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: path === "" ? 1 : 0.8,
  }));

  let categoryRoutes = [];
  try {
    const categories = await listCategories({ next: { revalidate: 3600 } });
    categoryRoutes = categories.map((category) => ({
      url: `${SITE}${categoryHref(category.name)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch {
    categoryRoutes = [];
  }

  return [...staticRoutes, ...categoryRoutes];
}
