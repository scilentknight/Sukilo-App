import { authRequest } from "./auth";

/* Seller onboarding endpoints (app/api/v1/endpoints/vendor_applications.py) */

export function createVendorApplication(payload) {
  return authRequest("/api/v1/vendor/applications", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateVendorApplication(vendorCountryId, payload) {
  return authRequest(`/api/v1/vendor/applications/${vendorCountryId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function addVendorDocument(vendorCountryId, payload) {
  return authRequest(
    `/api/v1/vendor/applications/${vendorCountryId}/documents`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function submitVendorApplication(vendorCountryId, termsVersion) {
  return authRequest(`/api/v1/vendor/applications/${vendorCountryId}/submit`, {
    method: "POST",
    body: JSON.stringify({ terms_version: termsVersion }),
  });
}

export function getVendorApplication(vendorCountryId) {
  return authRequest(`/api/v1/vendor/applications/${vendorCountryId}`);
}
