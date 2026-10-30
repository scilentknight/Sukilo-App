import { authRequest } from "./auth";

/** GET /api/v1/me — current user profile */
export function getProfile() {
  return authRequest("/api/v1/me");
}

/** GET /api/v1/access/me — current user roles */
export function getRoles() {
  return authRequest("/api/v1/access/me");
}
