import { apiRequest, toQueryString } from "@/lib/api/api";
import { authRequest } from "@/lib/api/auth";

const BASE_URL = "/api/v1/products";

export function listProducts(params = {}) {
  return apiRequest(`${BASE_URL}${toQueryString(params)}`);
}

export function getProduct(id) {
  return apiRequest(`${BASE_URL}/${id}`);
}

export function listCategories() {
  return apiRequest(`${BASE_URL}/categories`);
}

export function createProduct(formData) {
  return authRequest(BASE_URL, {
    method: "POST",
    body: formData,
  });
}

export function deleteProduct(id) {
  return authRequest(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
}
