import { authRequest } from "./auth";
import { toQueryString } from "./api";

function get(path, params) {
  return authRequest(`${path}${toQueryString(params)}`);
}

function post(path, body, headers) {
  return authRequest(path, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

function put(path, body) {
  return authRequest(path, { method: "PUT", body: JSON.stringify(body) });
}

/* ------------------------------------------------------------------ *
 * Read-only admin endpoints (app/api/v1/endpoints/admin.py)
 * ------------------------------------------------------------------ */

export function getAdminOverview() {
  return get("/api/v1/admin/overview");
}

export function listAdminCountries() {
  return get("/api/v1/admin/countries");
}

export function listAdminCustomers({ q, status, limit = 25, offset = 0 } = {}) {
  return get("/api/v1/admin/customers", {
    q,
    account_status: status,
    limit,
    offset,
  });
}

export function listAdminVendors({
  q,
  status,
  countryCode,
  limit = 25,
  offset = 0,
} = {}) {
  return get("/api/v1/admin/vendors", {
    q,
    vendor_status: status,
    country_code: countryCode,
    limit,
    offset,
  });
}

export function getAdminVendor(vendorId) {
  return get(`/api/v1/admin/vendors/${vendorId}`);
}

export function listAdminApplications({
  q,
  countryCode,
  status,
  limit = 25,
  offset = 0,
} = {}) {
  return get("/api/v1/admin/vendor-applications", {
    q,
    country_code: countryCode,
    onboarding_status: status,
    limit,
    offset,
  });
}

export function listAdminCategories(localeCode = "en") {
  return get("/api/v1/admin/catalog/categories", { locale_code: localeCode });
}

export function listAdminBrands() {
  return get("/api/v1/admin/catalog/brands");
}

export function listAdminCatalogProducts({
  q,
  status,
  countryCode,
  localeCode = "en",
  limit = 25,
  offset = 0,
} = {}) {
  return get("/api/v1/admin/catalog/products", {
    q,
    product_status: status,
    country_code: countryCode,
    locale_code: localeCode,
    limit,
    offset,
  });
}

export function listAdminOffers({
  q,
  countryCode,
  publicationStatus,
  localeCode = "en",
  limit = 25,
  offset = 0,
} = {}) {
  return get("/api/v1/admin/catalog/offers", {
    q,
    country_code: countryCode,
    publication_status: publicationStatus,
    locale_code: localeCode,
    limit,
    offset,
  });
}

/* ------------------------------------------------------------------ *
 * Access control
 * ------------------------------------------------------------------ */

export function listRoles() {
  return get("/api/v1/access/roles");
}

export function listPermissions() {
  return get("/api/v1/access/permissions");
}

export function listAssignments({ userId, countryId, limit = 50, cursor } = {}) {
  return get("/api/v1/access/assignments", {
    user_id: userId,
    country_id: countryId,
    limit,
    cursor,
  });
}

/* ------------------------------------------------------------------ *
 * Vendor review actions
 * ------------------------------------------------------------------ */

export function listVendorReviews(countryCode) {
  return get("/api/v1/vendor/reviews", { country_code: countryCode });
}

export function approveApplication(vendorCountryId, stepUpGrant) {
  return post(
    `/api/v1/vendor/reviews/${vendorCountryId}/approve`,
    undefined,
    { "X-Step-Up-Grant": stepUpGrant },
  );
}

export function rejectApplication(vendorCountryId, reason, stepUpGrant) {
  return post(
    `/api/v1/vendor/reviews/${vendorCountryId}/reject`,
    { reason },
    { "X-Step-Up-Grant": stepUpGrant },
  );
}

export function requestApplicationInfo(vendorCountryId, reason, stepUpGrant) {
  return post(
    `/api/v1/vendor/reviews/${vendorCountryId}/request-info`,
    { reason },
    { "X-Step-Up-Grant": stepUpGrant },
  );
}

/* ------------------------------------------------------------------ *
 * Catalog taxonomy actions
 * ------------------------------------------------------------------ */

export function createCategory({ code, name, localeCode, parentId }) {
  return post("/api/v1/catalog/categories", {
    code,
    name,
    locale_code: localeCode,
    parent_id: parentId || null,
  });
}

export function enableCategory(categoryId, countryCode, stepUpGrant) {
  return post(
    `/api/v1/catalog/categories/${categoryId}/enable`,
    { country_code: countryCode },
    { "X-Step-Up-Grant": stepUpGrant },
  );
}

/* ------------------------------------------------------------------ *
 * Account settings
 * ------------------------------------------------------------------ */

export function getProfile() {
  return get("/api/v1/me");
}

export function getPreferences() {
  return get("/api/v1/me/preferences");
}

export function updatePreferences(payload) {
  return put("/api/v1/me/preferences", payload);
}

export function listSessions() {
  return get("/api/v1/auth/sessions");
}

export function revokeSession(sessionId) {
  return authRequest(`/api/v1/auth/sessions/${sessionId}`, { method: "DELETE" });
}

export function revokeOtherSessions() {
  return post("/api/v1/auth/sessions/revoke-all", { keep_current: true });
}

/* ------------------------------------------------------------------ *
 * Legacy storefront products (what /products shows)
 * ------------------------------------------------------------------ */

export function listStoreProducts({ skip = 0, limit = 10, q } = {}) {
  return get("/api/v1/products", { skip, limit, q });
}

export function createStoreProduct(formData) {
  return authRequest("/api/v1/products", { method: "POST", body: formData });
}

export function listStoreCategories() {
  return get("/api/v1/products/categories");
}
