import { apiRequest, toQueryString } from "./api";
import { authRequest } from "./auth";

/** GET /api/v1/products — list with optional filters */
export function listProducts(params = {}) {
  return apiRequest(`/api/v1/products${toQueryString(params)}`);
}

/** GET /api/v1/products/{id} — single product with images */
export function getProduct(id) {
  return apiRequest(`/api/v1/products/${id}`);
}

/** GET /api/v1/products/categories — returns { items: [{name, count}] } */
export function listCategories() {
  return apiRequest("/api/v1/products/categories");
}

/** POST /api/v1/products — create product (admin, multipart/form-data) */
export function createProduct(formData) {
  return authRequest("/api/v1/products", {
    method: "POST",
    body: formData,
  });
}

/** DELETE /api/v1/products/{id} — delete product (admin) */
export function deleteProduct(id) {
  return authRequest(`/api/v1/products/${id}`, { method: "DELETE" });
}
