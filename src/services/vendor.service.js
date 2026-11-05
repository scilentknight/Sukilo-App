import { authRequest } from "@/lib/api/auth";

const BASE_URL = "/api/v1/vendor/applications";

export function createVendorApplication(payload) {
  return authRequest(BASE_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateVendorApplication(vendorCountryId, payload) {
  return authRequest(`${BASE_URL}/${vendorCountryId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function addVendorDocument(vendorCountryId, payload) {
  return authRequest(`${BASE_URL}/${vendorCountryId}/documents`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function submitVendorApplication(vendorCountryId, termsVersion) {
  return authRequest(`${BASE_URL}/${vendorCountryId}/submit`, {
    method: "POST",
    body: JSON.stringify({ terms_version: termsVersion }),
  });
}

export function getVendorApplication(vendorCountryId) {
  return authRequest(`${BASE_URL}/${vendorCountryId}`);
}
