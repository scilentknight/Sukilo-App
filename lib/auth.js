import { ApiError, apiRequest } from "./api";

/**
 * Session model (matches Sukilo-Api):
 * - login/refresh return a short-lived bearer `access_token`, kept in memory only;
 * - the refresh token is an HttpOnly cookie scoped to `/api/v1/auth` on the API;
 * - refresh/logout require `X-CSRF-Token`, echoed from the `csrf_token` the API
 *   returns. It is kept in localStorage so a reload can restore the session; it
 *   is useless without the HttpOnly cookie and the API's Origin check.
 */
const CSRF_STORAGE_KEY = "sukilo_csrf";
const SESSION_LOCK = "sukilo-auth-session";
const TAB_CHANNEL = "sukilo-auth";

let accessToken = null;
/** When the current access token came from a password login (refreshed tokens don't count). */
let passwordSignInAt = null;
let refreshInFlight = null;
let channel;
const listeners = new Set();

/**
 * Refresh tokens rotate on every use and the API revokes the whole session if
 * a rotated one is presented again, so tabs must never refresh concurrently.
 */
function withSessionLock(task) {
  if (typeof navigator === "undefined" || !navigator.locks) return task();
  return navigator.locks.request(SESSION_LOCK, task);
}

/**
 * Same-origin channel through which tabs share the current access token (or
 * sign-out), since a refresh in one tab invalidates the others' tokens.
 */
function tabChannel() {
  if (channel === undefined) {
    channel = typeof BroadcastChannel === "undefined" ? null : new BroadcastChannel(TAB_CHANNEL);
    channel?.addEventListener("message", ({ data }) => {
      accessToken = data?.accessToken ?? null;
      passwordSignInAt = null;
      notify();
    });
  }
  return channel;
}

function readCsrfToken() {
  try {
    return window.localStorage.getItem(CSRF_STORAGE_KEY);
  } catch {
    return null;
  }
}

function notify() {
  for (const listener of listeners) listener();
}

function storeSession({ access_token: token, csrf_token: csrfToken }, { viaPassword = false } = {}) {
  accessToken = token;
  passwordSignInAt = viaPassword ? Date.now() : null;
  if (csrfToken) window.localStorage.setItem(CSRF_STORAGE_KEY, csrfToken);
  tabChannel()?.postMessage({ accessToken: token });
  notify();
}

function clearSession() {
  accessToken = null;
  passwordSignInAt = null;
  try {
    window.localStorage.removeItem(CSRF_STORAGE_KEY);
  } catch {
    // Storage can be unavailable (private mode); nothing to clear then.
  }
  tabChannel()?.postMessage({ accessToken: null });
  notify();
}

function post(path, body, headers) {
  return apiRequest(path, {
    method: "POST",
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export function isSignedIn() {
  return accessToken !== null;
}

/**
 * Whether the current access token comes from a password login made within
 * `maxAgeMs`. The API requires this for closing the account and changing the
 * email/phone; tokens from a refresh (for example after a reload) do not qualify.
 */
export function hasRecentPasswordSignIn(maxAgeMs) {
  return passwordSignInAt !== null && Date.now() - passwordSignInAt < maxAgeMs;
}

/** Whether a previous session may be restorable via refresh (before any network call). */
export function hasStoredSession() {
  return readCsrfToken() !== null;
}

/** Subscribe to sign-in/sign-out changes. Returns an unsubscribe function. */
export function subscribe(listener) {
  listeners.add(listener);
  tabChannel();
  return () => listeners.delete(listener);
}

/** POST /auth/register — creates a pending account and emails a 6-digit code. */
export function register({ email, phone, password, countryCode, localeCode }) {
  return post("/api/v1/auth/register", {
    email,
    phone_e164: phone || null,
    password,
    country_code: countryCode,
    locale_code: localeCode,
  });
}

/** POST /auth/otp/verify (REGISTER) — activates the account. */
export function verifyRegistration({ challengeId, code }) {
  return post("/api/v1/auth/otp/verify", {
    challenge_id: challengeId,
    purpose: "REGISTER",
    code,
  });
}

/** POST /auth/login — `identifier` is an email address or E.164 phone number. */
export async function login({ identifier, password, countryCode, deviceName = "Web browser" }) {
  const data = await post("/api/v1/auth/login", {
    identifier,
    password,
    country_code: countryCode,
    device_name: deviceName,
  });
  storeSession(data, { viaPassword: true });
  return data;
}

/** POST /auth/password/forgot — always answers 202 so account existence is not revealed. */
export function requestPasswordReset({ email, countryCode, localeCode }) {
  return post("/api/v1/auth/password/forgot", {
    email,
    country_code: countryCode,
    locale_code: localeCode,
  });
}

/** POST /auth/otp/request (RESET) — sends a fresh reset code; also answers 202 for unknown accounts. */
export function resendPasswordResetCode({ email, countryCode, localeCode }) {
  return post("/api/v1/auth/otp/request", {
    identifier: email,
    purpose: "RESET",
    country_code: countryCode,
    locale_code: localeCode,
  });
}

/** POST /auth/otp/verify (RESET) — exchanges the emailed code for a one-time reset grant. */
export async function verifyPasswordResetCode({ challengeId, code }) {
  const data = await post("/api/v1/auth/otp/verify", {
    challenge_id: challengeId,
    purpose: "RESET",
    code,
  });
  return data.grant;
}

/** POST /auth/password/reset */
export function resetPassword({ grant, newPassword, localeCode }) {
  return post("/api/v1/auth/password/reset", {
    grant,
    new_password: newPassword,
    locale_code: localeCode,
  });
}

/** POST /auth/token/refresh — rotates the refresh cookie and issues a new access token. */
export function refreshSession() {
  if (refreshInFlight) return refreshInFlight;
  const tokenBefore = accessToken;
  refreshInFlight = withSessionLock(async () => {
    // Another tab refreshed while this one waited for the lock and shared its token.
    if (accessToken && accessToken !== tokenBefore) return true;
    const csrfToken = readCsrfToken();
    if (!csrfToken) {
      clearSession();
      return false;
    }
    try {
      storeSession(await post("/api/v1/auth/token/refresh", undefined, { "X-CSRF-Token": csrfToken }));
      return true;
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        clearSession();
      }
      return false;
    }
  }).finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

/** POST /auth/logout — revokes the session server-side, then forgets it locally. */
export function logout() {
  return withSessionLock(async () => {
    const csrfToken = readCsrfToken();
    try {
      if (csrfToken) await post("/api/v1/auth/logout", undefined, { "X-CSRF-Token": csrfToken });
    } finally {
      clearSession();
    }
  });
}

function withBearer(options) {
  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${accessToken}`);
  return { ...options, headers };
}

/**
 * `apiRequest` for endpoints that need a signed-in user. Restores the session
 * on first use and retries once after an expired access token is refreshed.
 */
export async function authRequest(path, options = {}) {
  if (!accessToken) await refreshSession();
  if (!accessToken) throw new ApiError("Please sign in to continue.", 401);

  const tokenUsed = accessToken;
  try {
    return await apiRequest(path, withBearer(options));
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;
    const replacedMeanwhile = accessToken !== null && accessToken !== tokenUsed;
    if (!replacedMeanwhile && !(await refreshSession())) throw error;
    return apiRequest(path, withBearer(options));
  }
}
