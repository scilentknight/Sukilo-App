/**
 * The product listing is URL-driven so results are shareable and
 * server-renderable. The API supports text search (`q`), an exact category
 * name, and offset pagination (newest first), so the URL carries exactly that.
 */

export const PAGE_SIZE = 24;

function first(value) {
  return Array.isArray(value) ? value[0] : value;
}

/** Parses Next.js search params into `{ search, category, page }`. */
export function parseProductParams(params) {
  const page = Number.parseInt(first(params.page) ?? "", 10);
  return {
    search: first(params.search)?.trim() ?? "",
    category: first(params.category)?.trim() ?? "",
    page: Number.isFinite(page) && page > 1 ? page : 1,
  };
}

/** Converts parsed URL state into `listProducts` arguments. */
export function toProductQuery({ search, category, page }) {
  return {
    skip: (page - 1) * PAGE_SIZE,
    limit: PAGE_SIZE,
    q: search || undefined,
    category: category || undefined,
  };
}

/** Serialises listing state into a `/product` href, omitting defaults. */
export function buildProductHref({ search, category, page } = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (category) params.set("category", category);
  if (page && page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/product?${qs}` : "/product";
}

export function categoryHref(name) {
  return buildProductHref({ category: name });
}
