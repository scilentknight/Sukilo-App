const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * @returns {string}
 */
export function getApiBaseUrl() {
  return API_URL.replace(/\/$/, "");
}

/**
 * @param {Response} response
 * @returns {Promise<never>}
 */
async function throwApiError(response) {
  let errorMessage = `API request failed with status ${response.status}`;
  try {
    const errorData = await response.json();
    if (errorData?.detail) {
      errorMessage =
        typeof errorData.detail === "string"
          ? errorData.detail
          : JSON.stringify(errorData.detail);
    } else if (errorData?.message) {
      errorMessage = errorData.message;
    }
  } catch {
    // Non-JSON error response
  }
  const error = new Error(errorMessage);
  error.status = response.status;
  throw error;
}

/**
 * Search products by image using multipart form data.
 *
 * @param {File} file
 * @param {{ limit?: number, category?: string }} [options]
 * @returns {Promise<{ results: Array<Record<string, unknown>> }>}
 */
/**
 * @param {{ skip?: number, limit?: number, category?: string, q?: string }} [params]
 */
export async function listProducts(params = {}) {
  const { skip = 0, limit = 48, category, q } = params;
  const query = new URLSearchParams();
  query.set("skip", String(skip));
  query.set("limit", String(limit));
  if (category) {
    query.set("category", category);
  }
  if (q) {
    query.set("q", q);
  }
  return apiFetch(`/api/v1/products?${query.toString()}`);
}

export async function listCategories() {
  return apiFetch("/api/v1/products/categories");
}

/**
 * @param {string} gtin
 */
export async function getProductByGtin(gtin) {
  return apiFetch(`/api/v1/products/gtin/${encodeURIComponent(gtin)}`);
}

/**
 * @param {string} code
 */
export async function searchProductByBarcode(code) {
  const query = new URLSearchParams({ code });
  return apiFetch(`/api/v1/search/barcode?${query.toString()}`);
}

/**
 * Create a vendor product with multipart images.
 *
 * @param {FormData} formData
 * @returns {Promise<Record<string, unknown>>}
 */
export async function createProduct(formData) {
  const url = `${getApiBaseUrl()}/api/v1/products`;
  let response;
  try {
    response = await fetch(url, { method: "POST", body: formData });
  } catch {
    throw new Error(
      `Network error: Could not reach backend at ${API_URL}. Make sure the FastAPI server is running.`
    );
  }
  if (!response.ok) {
    await throwApiError(response);
  }
  return response.json();
}

export async function searchProductsByImage(file, options = {}) {
  const { limit = 20, category } = options;
  const formData = new FormData();
  formData.append("image", file);
  formData.append("limit", String(limit));
  if (category) {
    formData.append("category", category);
  }
  const url = `${getApiBaseUrl()}/api/v1/search/image`;
  let response;
  try {
    response = await fetch(url, { method: "POST", body: formData });
  } catch {
    throw new Error(
      `Network error: Could not reach backend at ${API_URL}. Make sure the FastAPI server is running.`
    );
  }
  if (!response.ok) {
    await throwApiError(response);
  }
  return response.json();
}

export async function apiFetch(endpoint, options = {}) {
  const { headers, ...customOptions } = options;

  const config = {
    ...customOptions,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  const normalizedBase = API_URL.replace(/\/$/, "");
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${normalizedBase}${normalizedEndpoint}`;

  let response;
  try {
    response = await fetch(url, config);
  } catch (err) {
    throw new Error(
      `Network error: Could not reach backend at ${API_URL}. Make sure the FastAPI server is running.`
    );
  }

  if (!response.ok) {
    await throwApiError(response);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}