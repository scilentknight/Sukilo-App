import { apiRequest } from "./api";

/** GET /api/v1/health */
export function getApiHealth() {
  return apiRequest("/api/v1/health", { cache: "no-store" });
}

/** GET /api/v1/database-test */
export function getDatabaseHealth() {
  return apiRequest("/api/v1/database-test", { cache: "no-store" });
}

/** GET /api/v1/vectors/health — 503 when the visual-search stack is disabled or down. */
export function getVectorHealth() {
  return apiRequest("/api/v1/vectors/health", { cache: "no-store" });
}
