"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listProducts, listCategories } from "@/lib/products";
import { Skeleton } from "@/components/ui";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      listProducts({ limit: 1 }),
      listCategories(),
    ])
      .then(([productsData, catsData]) => {
        const productItems = Array.isArray(productsData)
          ? productsData
          : productsData?.items ?? [];
        const total = productsData?.total ?? productItems.length;
        const categories = catsData?.items ?? [];
        setStats({
          totalProducts: total,
          totalCategories: categories.length,
          categories,
        });
      })
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  // Reload with limit=1000 to get real count
  useEffect(() => {
    listProducts({ limit: 1000 })
      .then((data) => {
        const items = Array.isArray(data) ? data : data?.items ?? [];
        setStats((s) => s ? { ...s, totalProducts: data?.total ?? items.length } : s);
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-6">Dashboard</h2>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-ink-800 rounded-xl p-5 border border-ink-700">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))
        ) : (
          <>
            <StatCard
              label="Total Products"
              value={stats?.totalProducts ?? "—"}
              icon="📦"
              href="/admin/products"
            />
            <StatCard
              label="Categories"
              value={stats?.totalCategories ?? "—"}
              icon="🏷️"
            />
            <StatCard
              label="Status"
              value="Active"
              icon="✅"
              valueColor="text-emerald-400"
            />
          </>
        )}
      </div>

      {/* Category breakdown */}
      {stats?.categories?.length > 0 && (
        <div className="bg-ink-800 rounded-xl border border-ink-700 p-5">
          <h3 className="text-sm font-semibold text-ink-300 mb-4">Products by Category</h3>
          <div className="flex flex-col gap-2">
            {stats.categories.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between">
                <span className="text-sm text-ink-200">{cat.name}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-ink-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (cat.count / (stats.totalProducts || 1)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-ink-400 w-8 text-right">{cat.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <Link
          href="/admin/products"
          className="bg-ink-800 border border-ink-700 hover:border-brand-500 rounded-xl p-5 text-center transition-colors group"
        >
          <div className="text-3xl mb-2">📦</div>
          <p className="text-sm font-medium text-ink-200 group-hover:text-white">Manage Products</p>
        </Link>
        <Link
          href="/admin/users"
          className="bg-ink-800 border border-ink-700 hover:border-brand-500 rounded-xl p-5 text-center transition-colors group"
        >
          <div className="text-3xl mb-2">👥</div>
          <p className="text-sm font-medium text-ink-200 group-hover:text-white">View Users</p>
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, href, valueColor = "text-white" }) {
  const content = (
    <div className={`bg-ink-800 rounded-xl p-5 border transition-colors ${
      href ? "border-ink-700 hover:border-brand-500 cursor-pointer" : "border-ink-700"
    }`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        {href && (
          <svg className="w-4 h-4 text-ink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>
      <p className="text-xs text-ink-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

