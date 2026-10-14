import { ApiError, toQueryString } from "./api";
import { authRequest } from "./auth";

/**
 * Consent policy version accepted by the API for the active market. The API has
 * no endpoint that publishes it, so it is configured per deployment; the API
 * rejects stale versions.
 */
export const CONSENT_POLICY_VERSION = process.env.NEXT_PUBLIC_CONSENT_POLICY_VERSION || "dev-1";

function send(method, path, body, headers) {
  return authRequest(path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

/** GET /api/v1/me — masked profile of the signed-in customer. */
export function getProfile() {
  return authRequest("/api/v1/me");
}

/** GET /api/v1/auth/sessions — devices signed in to this account. */
export function listSessions() {
  return authRequest("/api/v1/auth/sessions");
}

/** DELETE /api/v1/auth/sessions/{id} */
export function revokeSession(sessionId) {
  return authRequest(`/api/v1/auth/sessions/${sessionId}`, { method: "DELETE" });
}

/**
 * POST /api/v1/auth/sessions/revoke-all — signs out every other device. The API
 * also invalidates current access tokens; `authRequest` refreshes on next use.
 */
export function revokeAllSessions({ keepCurrent = true } = {}) {
  return send("POST", "/api/v1/auth/sessions/revoke-all", { keep_current: keepCurrent });
}

/**
 * POST /api/v1/auth/otp/verify for signed-in purposes (STEP_UP, DATA_EXPORT,
 * VERIFY_EMAIL, VERIFY_PHONE). Returns the one-time grant.
 */
export async function verifyCode({ challengeId, purpose, code, actionClass }) {
  const data = await send("POST", "/api/v1/auth/otp/verify", {
    challenge_id: challengeId,
    purpose,
    code,
    ...(actionClass ? { action_class: actionClass } : {}),
  });
  return data.grant;
}

/** POST /api/v1/auth/step-up/request — re-checks the password and emails a STEP_UP code. */
export async function requestStepUp({ password, actionClass, localeCode }) {
  const data = await send("POST", "/api/v1/auth/step-up/request", {
    password,
    action_class: actionClass,
    locale_code: localeCode,
  });
  return data.challenge_id;
}

/* ---------------------------------------------------------------- Identifiers */

/** PATCH /api/v1/me — sends a code to the new email or phone. Returns the challenge id. */
export async function startIdentifierChange({ email, phone, countryCode, localeCode }) {
  const data = await send("PATCH", "/api/v1/me", {
    ...(email ? { new_email: email } : { new_phone_e164: phone }),
    country_code: countryCode,
    locale_code: localeCode,
  });
  return data.challenge_id;
}

/** POST /api/v1/me/identifier-change/confirm — the API ends all sessions afterwards. */
export function confirmIdentifierChange({ grant, email, phone, countryCode, localeCode }) {
  return send("POST", "/api/v1/me/identifier-change/confirm", {
    grant,
    ...(email ? { new_email: email } : { new_phone_e164: phone }),
    country_code: countryCode,
    locale_code: localeCode,
  });
}

/* ---------------------------------------------------------------- Preferences */

/** GET /api/v1/me/preferences — `null` until preferences are saved for the first time. */
export async function getPreferences() {
  try {
    return await authRequest("/api/v1/me/preferences");
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/** PUT /api/v1/me/preferences — omit `expectedVersion` on the first save; 409 when stale. */
export function savePreferences({ countryCode, localeCode, currencyCode, expectedVersion }) {
  return send("PUT", "/api/v1/me/preferences", {
    country_code: countryCode,
    locale_code: localeCode,
    currency_code: currencyCode,
    ...(expectedVersion ? { expected_version: expectedVersion } : {}),
  });
}

/* ------------------------------------------------------------------- Consents */

/** GET /api/v1/me/consents — current consent per type, or paged history. */
export function listConsents({ countryCode, history = false, limit, cursor } = {}) {
  const query = toQueryString({
    country_code: countryCode,
    history: history ? "true" : undefined,
    limit,
    cursor,
  });
  return authRequest(`/api/v1/me/consents${query}`);
}

/** POST /api/v1/me/consents */
export function recordConsent({ countryCode, consentType, granted }) {
  return send("POST", "/api/v1/me/consents", {
    country_code: countryCode,
    consent_type: consentType,
    policy_version: CONSENT_POLICY_VERSION,
    granted,
  });
}

/* ------------------------------------------------------------------ Addresses */

const addressesPath = (countryCode, addressId, extra = {}) =>
  `/api/v1/me/addresses${addressId ? `/${addressId}` : ""}${toQueryString({
    country_code: countryCode,
    ...extra,
  })}`;

/** GET /api/v1/me/addresses */
export function listAddresses(countryCode) {
  return authRequest(addressesPath(countryCode));
}

/** POST /api/v1/me/addresses — `address` uses the API's snake_case field names. */
export function createAddress(countryCode, address) {
  return send("POST", addressesPath(), { ...address, country_code: countryCode });
}

/** PATCH /api/v1/me/addresses/{id} — replaces the address; 409 when `expectedVersion` is stale. */
export function updateAddress(countryCode, addressId, address, expectedVersion) {
  return send("PATCH", addressesPath(countryCode, addressId), {
    ...address,
    expected_version: expectedVersion,
  });
}

/** POST /api/v1/me/addresses/{id}/default — `kind` is SHIPPING or BILLING. */
export function setDefaultAddress(countryCode, addressId, kind) {
  return send("POST", `/api/v1/me/addresses/${addressId}/default${toQueryString({ country_code: countryCode })}`, {
    kind,
  });
}

/** DELETE /api/v1/me/addresses/{id} */
export function deleteAddress(countryCode, addressId, expectedVersion) {
  return authRequest(addressesPath(countryCode, addressId, { expected_version: expectedVersion }), {
    method: "DELETE",
  });
}

/* ---------------------------------------------------------------- Data export */

/** POST /api/v1/me/data-export/verification — re-checks the password and emails a code. */
export async function requestDataExportVerification({ password, localeCode }) {
  const data = await send("POST", "/api/v1/me/data-export/verification", {
    password,
    locale_code: localeCode,
  });
  return data.challenge_id;
}

/** POST /api/v1/me/data-export — `idempotencyKey` makes retries return the same request. */
export function createDataExport({ countryCode, grant, idempotencyKey }) {
  return send(
    "POST",
    "/api/v1/me/data-export",
    { country_code: countryCode, grant },
    { "Idempotency-Key": idempotencyKey },
  );
}

/** GET /api/v1/me/data-exports/{id} */
export function getDataExport(exportId) {
  return authRequest(`/api/v1/me/data-exports/${exportId}`);
}

/**
 * Download-grant then download, for a READY export. Returns the opaque, one-time
 * `download_reference` (the API has no artifact endpoint yet).
 */
export async function getDataExportDownloadReference(exportId) {
  const { grant } = await send("POST", `/api/v1/me/data-exports/${exportId}/download-grant`);
  const data = await send("POST", `/api/v1/me/data-exports/${exportId}/download`, { grant });
  return data.download_reference;
}

/* -------------------------------------------------------------------- Closure */

/** POST /api/v1/me/closure — previews effects and returns a one-time `close_grant`. */
export function requestClosure({ password, stepUpGrant }) {
  return send("POST", "/api/v1/me/closure", { password, step_up_grant: stepUpGrant });
}

/** POST /api/v1/me/closure/confirm — closes the account and revokes every session. */
export function confirmClosure(closeGrant) {
  return send("POST", "/api/v1/me/closure/confirm", { close_grant: closeGrant });
}
