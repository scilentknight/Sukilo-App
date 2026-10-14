import { toQueryString } from "./api";
import { authRequest } from "./auth";

/** Step-up action classes the API requires for assignment mutations. */
export const GRANT_ACTION = "iam.assignment.grant";
export const REVOKE_ACTION = "iam.assignment.revoke";

const STAFF_ROLES = new Set([
  "SUPER_ADMIN",
  "COUNTRY_ADMIN",
  "COUNTRY_FINANCE",
  "COUNTRY_OPERATIONS",
  "MODERATOR_SUPPORT",
]);

/** GET /api/v1/access/me — the signed-in account's own role codes. Customers get []. */
export function listOwnRoles() {
  return authRequest("/api/v1/access/me");
}

/**
 * Staff open the admin panel. Customers stay on a storefront path.
 * A failed role lookup must not be treated as either destination.
 */
export function destinationForRoles(roles, callbackUrl) {
  const staff = Array.isArray(roles) && roles.some((code) => STAFF_ROLES.has(code));
  const callback = typeof callbackUrl === "string" ? callbackUrl : "";
  const sameOrigin = callback.startsWith("/") && !callback.startsWith("//");
  const adminPath = sameOrigin && callback.startsWith("/admin") && !callback.startsWith("/admin/login");
  if (staff) return adminPath ? callback : "/admin";
  if (sameOrigin && !callback.startsWith("/admin")) return callback || "/";
  return "/";
}

/** GET /api/v1/access/roles — requires `iam.role.read`; 403 otherwise. */
export function listRoles(countryId) {
  return authRequest(`/api/v1/access/roles${toQueryString({ country_id: countryId })}`);
}

/** GET /api/v1/access/permissions — requires `iam.permission.read`. */
export function listPermissions(countryId) {
  return authRequest(`/api/v1/access/permissions${toQueryString({ country_id: countryId })}`);
}

/** GET /api/v1/access/assignments — the API requires a user and/or country filter. */
export function listAssignments({ userId, countryId, limit, cursor }) {
  const query = toQueryString({ user_id: userId, country_id: countryId, limit, cursor });
  return authRequest(`/api/v1/access/assignments${query}`);
}

/** POST /api/v1/access/assignments — `stepUpGrant` comes from a STEP_UP code for GRANT_ACTION. */
export function grantAssignment(assignment, stepUpGrant) {
  return authRequest("/api/v1/access/assignments", {
    method: "POST",
    headers: { "X-Step-Up-Grant": stepUpGrant },
    body: JSON.stringify(assignment),
  });
}

/** DELETE /api/v1/access/assignments/{id} — `stepUpGrant` is for REVOKE_ACTION. */
export function revokeAssignment({ assignmentId, countryId, reason }, stepUpGrant) {
  return authRequest(`/api/v1/access/assignments/${assignmentId}${toQueryString({ country_id: countryId })}`, {
    method: "DELETE",
    headers: { "X-Step-Up-Grant": stepUpGrant },
    body: JSON.stringify({ reason }),
  });
}
