import { ApiError, apiRequest } from "./api";

const CSRF_STORAGE_KEY = "sukilo_csrf";
const SESSION_LOCK = "sukilo-auth-session";
const TAB_CHANNEL = "sukilo-auth";

let accessToken = null;
let passwordSignInAt = null;
let refreshInFlight = null;
let channel;
const listeners = new Set();

function withSessionLock(task) {
  if (typeof navigator === "undefined" || !navigator.locks) return task();
  return navigator.locks.request(SESSION_LOCK, task);
}

function tabChannel() {
  if (channel === undefined) {
    channel =
      typeof BroadcastChannel === "undefined"
        ? null
        : new BroadcastChannel(TAB_CHANNEL);
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

function storeSession(
  { access_token: token, csrf_token: csrfToken },
  { viaPassword = false } = {}
) {
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

export function hasRecentPasswordSignIn(maxAgeMs) {
  return passwordSignInAt !== null && Date.now() - passwordSignInAt < maxAgeMs;
}

export function hasStoredSession() {
  return readCsrfToken() !== null;
}

/** Subscribe to sign-in/sign-out changes. Returns an unsubscribe function. */
export function subscribe(listener) {
  listeners.add(listener);
  tabChannel();
  return () => listeners.delete(listener);
}

export function register({ email, phone, password, countryCode, localeCode }) {
  return post("/api/v1/auth/register", {
    email,
    phone_e164: phone || null,
    password,
    country_code: countryCode,
    locale_code: localeCode,
  });
}

/** POST /api/v1/auth/otp/verify (REGISTER) — activates the account. */
export function verifyRegistration({ challengeId, code }) {
  return post("/api/v1/auth/otp/verify", {
    challenge_id: challengeId,
    purpose: "REGISTER",
    code,
  });
}

/** POST /api/v1/auth/otp/resend */
export function resendRegistrationOtp({ challengeId }) {
  return post("/api/v1/auth/otp/resend", {
    challenge_id: challengeId,
    purpose: "REGISTER",
  });
}

/** POST /api/v1/auth/login */
export async function login({
  identifier,
  password,
  countryCode,
  deviceName = "Web browser",
}) {
  const data = await post("/api/v1/auth/login", {
    identifier,
    password,
    country_code: countryCode,
    device_name: deviceName,
  });
  storeSession(data, { viaPassword: true });
  return data;
}

/** POST /api/v1/auth/password/forgot */
export function requestPasswordReset({ email, countryCode, localeCode }) {
  return post("/api/v1/auth/password/forgot", {
    email,
    country_code: countryCode,
    locale_code: localeCode,
  });
}

/** POST /api/v1/auth/otp/verify (RESET) — exchanges code for a one-time reset grant. */
export async function verifyPasswordResetCode({ challengeId, code }) {
  const data = await post("/api/v1/auth/otp/verify", {
    challenge_id: challengeId,
    purpose: "RESET",
    code,
  });
  return data.grant;
}

/** POST /api/v1/auth/password/reset */
export function resetPassword({ grant, newPassword, localeCode }) {
  return post("/api/v1/auth/password/reset", {
    grant,
    new_password: newPassword,
    locale_code: localeCode,
  });
}

/** POST /api/v1/auth/token/refresh — rotates the refresh cookie and issues a new access token. */
export function refreshSession() {
  if (refreshInFlight) return refreshInFlight;
  const tokenBefore = accessToken;
  refreshInFlight = withSessionLock(async () => {
    if (accessToken && accessToken !== tokenBefore) return true;
    const csrfToken = readCsrfToken();
    if (!csrfToken) {
      clearSession();
      return false;
    }
    try {
      storeSession(
        await post("/api/v1/auth/token/refresh", undefined, {
          "X-CSRF-Token": csrfToken,
        })
      );
      return true;
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        clearSession();
      }
      return false;
    }
  }).finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

/** POST /api/v1/auth/logout — revokes the session server-side, then clears it locally. */
export function logout() {
  return withSessionLock(async () => {
    const csrfToken = readCsrfToken();
    try {
      if (csrfToken)
        await post("/api/v1/auth/logout", undefined, {
          "X-CSRF-Token": csrfToken,
        });
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
 * `apiRequest` for endpoints that need a signed-in user.
 * Restores the session on first use and retries once after an expired access token is refreshed.
 */
export async function authRequest(path, options = {}) {
  if (!accessToken) await refreshSession();
  if (!accessToken) throw new ApiError("Please sign in to continue.", 401);

  const tokenUsed = accessToken;
  try {
    return await apiRequest(path, withBearer(options));
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;
    const replacedMeanwhile =
      accessToken !== null && accessToken !== tokenUsed;
    if (!replacedMeanwhile && !(await refreshSession())) throw error;
    return apiRequest(path, withBearer(options));
  }
}

