import { apiRequest, resolveAssetUrl, toQueryString } from "./api";

/** The backend rejects `limit` above this value. */
export const MAX_PAGE_SIZE = 100;

/**
 * Shapes a backend `ProductRead` for the UI: absolute image URLs, a thumbnail,
 * and `price` as `{ amount, currency }` for the currency helpers.
 */
export function toCatalogProduct(product) {
  const images = (product.images ?? []).map((image) => ({
    ...image,
    image_url: resolveAssetUrl(image.image_url),
  }));
  const primary = images.find((image) => image.is_primary) ?? images[0];

  return {
    id: product.id,
    name: product.name,
    description: product.description ?? null,
    category: product.category,
    brand: product.brand ?? null,
    price: { amount: product.price, currency: product.currency },
    gtin: product.gtin ?? null,
    source: product.source,
    created_at: product.created_at,
    thumbnail: primary?.image_url ?? null,
    images,
  };
}

/** GET /api/v1/products — newest first, filtered by exact category and/or text. */
export async function listProducts({ skip = 0, limit = 24, category, q } = {}, options = {}) {
  const data = await apiRequest(
    `/api/v1/products${toQueryString({ skip, limit, category, q })}`,
    options,
  );
  return { ...data, items: data.items.map(toCatalogProduct) };
}

/** GET /api/v1/products/categories — `[{ name, count }]`. */
export async function listCategories(options = {}) {
  const data = await apiRequest("/api/v1/products/categories", options);
  return data.items;
}

/** GET /api/v1/products/{id} */
export async function getProduct(productId, options = {}) {
  return toCatalogProduct(await apiRequest(`/api/v1/products/${productId}`, options));
}

/** GET /api/v1/products/gtin/{gtin} */
export async function getProductByGtin(gtin, options = {}) {
  return toCatalogProduct(
    await apiRequest(`/api/v1/products/gtin/${encodeURIComponent(gtin)}`, options),
  );
}

/** POST /api/v1/products — multipart vendor product with images (indexed for visual search). */
export async function createProduct(formData) {
  return toCatalogProduct(
    await apiRequest("/api/v1/products", { method: "POST", body: formData }),
  );
}
