import { getCountry } from "@/config/locales";

/**
 * Deterministic preview data for the admin dashboard while the FastAPI
 * endpoint does not exist. Delete this file once `getAdminDashboard` calls
 * the API.
 */

const PRODUCTS = [
  "Wireless earbuds",
  "Cotton kurta set",
  "Stainless steel bottle",
  "Smart fitness band",
  "Pashmina shawl",
  "LED desk lamp",
  "Running shoes",
  "Ceramic tea set",
];
const CATEGORIES = ["Electronics", "Fashion", "Home & kitchen", "Sports", "Beauty", "Other"];
const CUSTOMERS = ["Aarav S.", "Priya K.", "Rahim U.", "Li Wei", "Emily R.", "Sita G.", "Karan M.", "Nusrat J."];
const VENDORS = ["Himalayan Crafts", "TechBazaar", "Urban Threads", "HomeNest"];
const STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "RETURNED", "CANCELLED"];

function seededRandom(seedText) {
  let seed = [...seedText].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
}

function isoDay(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function sampleDashboard({ range, countryCode }) {
  const country = getCountry(countryCode);
  const today = new Date();
  const random = seededRandom(`${country.code}:${isoDay(today)}`);
  const scale = country.usdRate;
  const money = (usd) => Math.round(usd * scale);

  const days = Math.max(range, 30) * 2;
  const revenueByDay = Array.from({ length: days }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - 1 - i));
    const weekend = date.getDay() === 0 || date.getDay() === 6;
    const orders = Math.round(18 + random() * 22 + (weekend ? 10 : 0) + i * 0.15);
    return { date: isoDay(date), orders, revenue: money(orders * (28 + random() * 14)) };
  });

  const windowed = revenueByDay.slice(-range);
  const rangeOrders = windowed.reduce((s, d) => s + d.orders, 0);
  const weights = [0.06, 0.12, 0.18, 0.56, 0.04, 0.04];
  const ordersByStatus = STATUSES.map((status, i) => ({ status, count: Math.round(rangeOrders * weights[i]) }));

  const recentOrders = Array.from({ length: 8 }, (_, i) => {
    const created = new Date(today.getTime() - (i * 47 + random() * 30) * 60_000);
    return {
      id: `SK${country.code}${String(904812 - i * 37)}`,
      customer: CUSTOMERS[i % CUSTOMERS.length],
      vendor: VENDORS[i % VENDORS.length],
      total: money(15 + random() * 140),
      status: STATUSES[i < 2 ? 0 : i < 4 ? 1 : i < 6 ? 2 : 3],
      created_at: created.toISOString(),
    };
  });

  return {
    sample: true,
    currency: country.currency,
    totals: {
      revenue: money(412_000 + random() * 40_000),
      orders: 11_840 + Math.round(random() * 400),
      customers: 6_215 + Math.round(random() * 200),
      products: 3_480,
      vendors: 186,
    },
    pending_vendor_applications: 7,
    revenue_by_day: revenueByDay,
    orders_by_status: ordersByStatus,
    top_products: PRODUCTS.slice(0, 6)
      .map((name, i) => ({ name, quantity: Math.round((rangeOrders / 6) * (1 - i * 0.12) * (0.8 + random() * 0.4)) }))
      .sort((a, b) => b.quantity - a.quantity),
    revenue_by_category: CATEGORIES.map((name, i) => ({
      name,
      revenue: money((rangeOrders * 34 * [0.34, 0.24, 0.16, 0.11, 0.09, 0.06][i]) | 0),
    })),
    recent_orders: recentOrders,
    low_stock: [
      { name: PRODUCTS[3], stock: 4 },
      { name: PRODUCTS[6], stock: 6 },
      { name: PRODUCTS[1], stock: 9 },
    ],
  };
}
