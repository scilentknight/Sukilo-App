export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
).replace(/\/+$/, "");

/** Error for non-2xx responses and network failures (`status` is 0 for the latter). */
export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

/** Turns backend-relative asset paths (`/uploads/...`) into absolute URLs. */
export function resolveAssetUrl(path) {
  if (!path) return null;
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** Builds a `?a=1&b=2` string, skipping empty values. */
export function toQueryString(params = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "")
      query.set(key, String(value));
  }
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

function errorMessage(body, status) {
  const detail = body?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((item) => item.msg || JSON.stringify(item)).join(", ");
  if (typeof detail?.message === "string") return detail.message;
  if (typeof body?.message === "string") return body.message;
  return `API request failed (${status})`;
}

/**
 * Single entry point for talking to the FastAPI backend.
 *
 * Accepts normal `fetch` options plus Next.js `next` cache options. Plain
 * objects in `body` should already be `JSON.stringify`-ed; `FormData` is sent
 * as-is so the browser sets the multipart boundary.
 */

export async function apiRequest(path, options = {}) {
  const { headers: customHeaders, ...requestOptions } = options;
  const headers = new Headers(customHeaders || {});

  if (
    requestOptions.body &&
    !(requestOptions.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }
  if (!headers.has("Accept")) headers.set("Accept", "application/json");

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      credentials: "include",
      ...requestOptions,
      headers,
    });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new ApiError(
      `Could not reach the Sukilo API at ${API_URL}. Make sure the backend is running.`,
      0,
    );
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(
      errorMessage(body, response.status),
      response.status,
      body,
    );
  }

  if (
    response.status === 204 ||
    response.status === 205 ||
    response.headers.get("Content-Length") === "0"
  ) {
    return null;
  }

  const contentType = response.headers.get("Content-Type") || "";
  return contentType.includes("application/json")
    ? response.json()
    : response.text();
}
