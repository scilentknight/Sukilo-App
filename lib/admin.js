import { sampleDashboard } from "./admin-sample";

/**
 * Admin dashboard figures for one market, in that market's currency.
 *
 * The FastAPI backend has no dashboard endpoint yet, so this returns sample
 * data flagged with `sample: true` (the page shows a banner). To integrate,
 * replace the body with an `authRequest` call that returns the same shape and
 * delete `lib/admin-sample.js`, for example:
 *
 *   return authRequest(`/api/v1/admin/dashboard?range=${range}&country_code=${countryCode}`);
 *
 * Response shape (amounts are numbers or decimal strings in `currency`):
 * {
 *   currency: "NPR",
 *   totals: { revenue, orders, customers, products, vendors },       // all time
 *   pending_vendor_applications: number,
 *   revenue_by_day: [{ date: "YYYY-MM-DD", revenue, orders }],       // oldest first; send 2×range days
 *                                                                    // (min. 60) for period comparisons
 *   orders_by_status: [{ status, count }],                           // within range
 *   top_products: [{ name, quantity }],                              // within range
 *   revenue_by_category: [{ name, revenue }],                        // optional
 *   recent_orders: [{ id, customer, vendor, total, status, created_at }],
 *   low_stock: [{ name, stock }],                                    // optional
 * }
 */
export async function getAdminDashboard({ range, countryCode }) {
  return sampleDashboard({ range, countryCode });
}
