import { getApiBaseUrl } from "@/lib/api";

/**
 * @param {{ images?: Array<{ image_url: string, is_primary?: boolean }> }} product
 * @returns {string | null}
 */
export function getProductImageUrl(product) {
  const images = product.images ?? [];
  if (!images.length) {
    return null;
  }
  const primary = images.find((img) => img.is_primary) ?? images[0];
  const path = primary.image_url;
  if (path.startsWith("http")) {
    return path;
  }
  return `${getApiBaseUrl()}${path}`;
}

/**
 * @param {Array<Record<string, unknown>>} products
 * @param {"newest" | "price-asc" | "price-desc"} sortBy
 */
export function sortCatalogProducts(products, sortBy) {
  const copy = [...products];
  if (sortBy === "price-asc") {
    copy.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (sortBy === "price-desc") {
    copy.sort((a, b) => Number(b.price) - Number(a.price));
  }
  return copy;
}
