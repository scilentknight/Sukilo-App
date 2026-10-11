import { listBrands } from "./brands";
import { listCategories } from "./categories";
import { request, type RequestOptions } from "./client";
import { searchProducts } from "./products";
import type { Brand, Category, Paginated, ProductListItem } from "./types";

/**
 * Raised when a search mode has a complete front-end experience but no
 * corresponding backend endpoint yet. The UI uses `feature` to render a
 * helpful, honest message instead of faking results.
 */
export class FeatureUnavailableError extends Error {
  readonly feature: string;
  constructor(feature: string, message: string) {
    super(message);
    this.name = "FeatureUnavailableError";
    this.feature = feature;
  }
}

/* -------------------------------------------------------------------------- */
/*                              Text search + autocomplete                     */
/* -------------------------------------------------------------------------- */

export interface SearchSuggestions {
  products: ProductListItem[];
  categories: Category[];
  brands: Brand[];
}

/**
 * Aggregated autocomplete. The API has no dedicated suggestion endpoint, so we
 * fan out to the existing list/search endpoints with a small page size. The
 * caller (see `useSearchSuggestions`) debounces input before calling this.
 */
export async function getSearchSuggestions(
  q: string,
  options: RequestOptions = {},
): Promise<SearchSuggestions> {
  const term = q.trim();
  if (!term) return { products: [], categories: [], brands: [] };

  const [products, categories, brands] = await Promise.all([
    searchProducts(term, { limit: 5 }, options),
    listCategories({ q: term, limit: 5 }, options),
    listBrands({ q: term, limit: 5 }, options),
  ]);

  return {
    products: products.items,
    categories: categories.items,
    brands: brands.items,
  };
}

/* -------------------------------------------------------------------------- */
/*                                  Image search                              */
/* -------------------------------------------------------------------------- */

/**
 * Visual product search.
 *
 * TODO(backend): The FastAPI API does **not** currently expose an image-search
 * endpoint. When one is added (e.g. `POST /api/v1/products/search/image`
 * accepting `multipart/form-data` with a `file` field), replace the body below
 * with a real request and delete the throw. The complete UI (file picker,
 * preview, validation, loading state) lives in
 * `src/components/search/ImageSearchDialog.tsx` and is already wired to call
 * this function.
 */
export async function searchByImage(
  _file: File,
  _options: RequestOptions = {},
): Promise<Paginated<ProductListItem>> {
  void _file;
  void _options;
  throw new FeatureUnavailableError(
    "Image search",
    "Image search is not available yet. The front-end is ready and will start working as soon as the backend keyword/visual search endpoint is connected.",
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Voice search                              */
/* -------------------------------------------------------------------------- */

/**
 * Voice search itself happens in the browser (Web Speech API — see
 * `src/hooks/useVoiceSearch.ts`). Once speech is transcribed to text we use the
 * standard product search endpoint, so no backend changes are required.
 */
export function searchByVoice(
  transcript: string,
  options: RequestOptions = {},
): Promise<Paginated<ProductListItem>> {
  return searchProducts(transcript.trim(), { limit: 24 }, options);
}

/* -------------------------------------------------------------------------- */
/*                                 Barcode search                             */
/* -------------------------------------------------------------------------- */

/**
 * Barcode lookup.
 *
 * TODO(backend): There is no dedicated barcode endpoint. Barcodes are exposed
 * on product detail (`barcode`) and variants, and the general search does not
 * index them. As a best-effort bridge we query the search endpoint; when a real
 * endpoint exists (e.g. `GET /api/v1/products/barcode/{code}`) swap it in here.
 */
export function searchByBarcode(
  code: string,
  options: RequestOptions = {},
): Promise<Paginated<ProductListItem>> {
  const normalized = code.trim();
  if (!normalized) {
    return Promise.resolve({
      items: [],
      pagination: { limit: 0, page: 1, total: 0, has_next: false },
    });
  }
  return searchProducts(normalized, { limit: 24 }, options);
}

/* -------------------------------------------------------------------------- */
/*                         Popular searches (placeholder)                     */
/* -------------------------------------------------------------------------- */

/**
 * Popular searches are a front-end placeholder: the API exposes no trending
 * endpoint. Kept in one place so it can be replaced by a real endpoint later.
 */
export const POPULAR_SEARCHES: string[] = [
  "backpack",
  "bluetooth speaker",
  "wireless headphones",
  "smart watch",
  "running shoes",
  "laptop",
];

/** Thin re-export so callers can hit raw product search without extra imports. */
export { searchProducts };

/** Explicit re-export for advanced callers that need the base request helper. */
export { request };
