import { apiRequest, resolveAssetUrl, toQueryString } from "./api";
import { decodeBarcodeFromFile } from "./barcode";
import { listCategories, listProducts, toCatalogProduct } from "./products";

/** Quick-pick terms shown before the user types (the API has no trending endpoint). */
export const POPULAR_SEARCHES = ["shoes", "t-shirt", "jeans", "watch", "bag", "dress"];

/** GET /api/v1/search/barcode — resolves a GS1 Digital Link, GTIN, UPC or EAN to one product. */
export async function searchByBarcode(code, options = {}) {
  return toCatalogProduct(
    await apiRequest(`/api/v1/search/barcode${toQueryString({ code: code.trim() })}`, options),
  );
}

/** Decodes a barcode photo in the browser, then looks the code up. */
export async function searchByBarcodePhoto(file) {
  return searchByBarcode(await decodeBarcodeFromFile(file));
}

/**
 * POST /api/v1/search/image — visually similar products for a photo.
 * The backend already drops matches below `SEARCH_MIN_SIMILARITY`.
 */
export async function searchByImage(file, { limit = 20, category } = {}) {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("limit", String(limit));
  if (category) formData.append("category", category);

  const data = await apiRequest("/api/v1/search/image", { method: "POST", body: formData });
  return data.results.map((result) => ({
    ...result,
    image_url: resolveAssetUrl(result.image_url),
  }));
}

/**
 * Autocomplete: a few matching products plus categories whose name contains the
 * term. Category names come from the (small) category list endpoint.
 */
export async function getSearchSuggestions(term, options = {}) {
  const q = term.trim();
  if (!q) return { products: [], categories: [] };

  const [products, categories] = await Promise.all([
    listProducts({ q, limit: 5 }, options),
    listCategories(options),
  ]);
  const needle = q.toLowerCase();
  return {
    products: products.items,
    categories: categories.filter((category) => category.name.toLowerCase().includes(needle)),
  };
}
