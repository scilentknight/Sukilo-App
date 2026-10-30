"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { LoadingSpinner } from "@/components/ui";

export default function AccountPage() {
  const { user, roles, isAdmin, isLoading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  if (isLoading) return <LoadingSpinner message="Loading account…" />;
  if (!user) return null;

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  const lastLogin = user.last_login_at
    ? new Date(user.last_login_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  return (
    <div className="container-page py-10 max-w-3xl">
      <h1 className="text-2xl font-bold text-ink-800 mb-8">My Account</h1>

      <div className="grid gap-6">
        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-ink-100 shadow-sm p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center text-2xl">
                👤
              </div>
              <div>
                <h2 className="font-semibold text-ink-800 text-lg">
                  {user.email_masked || "Account"}
                </h2>
                <span
                  className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full mt-1 ${
                    user.status === "ACTIVE"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {user.status}
                </span>
              </div>
            </div>
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
              >
                <span>⚙️</span> Admin Panel
              </Link>
            )}
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoField label="Email" value={user.email_masked} />
            <InfoField label="Phone" value={user.phone_masked || "—"} />
            <InfoField label="Email Verified" value={user.email_verified ? "✅ Yes" : "❌ No"} />
            <InfoField label="Phone Verified" value={user.phone_verified ? "✅ Yes" : "❌ No"} />
            <InfoField label="Member Since" value={memberSince} />
            <InfoField label="Last Login" value={lastLogin} />
          </dl>
        </div>

        {/* Roles */}
        {roles.length > 0 && (
          <div className="bg-white rounded-2xl border border-ink-100 shadow-sm p-6">
            <h3 className="font-semibold text-ink-700 mb-3">Roles &amp; Permissions</h3>
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => (
                <span
                  key={role}
                  className="px-3 py-1.5 bg-brand-50 text-brand-700 border border-brand-200 rounded-full text-xs font-semibold"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-2xl border border-ink-100 shadow-sm p-6">
          <h3 className="font-semibold text-ink-700 mb-4">Account Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/products"
              className="px-4 py-2 bg-ink-100 text-ink-700 rounded-lg text-sm font-medium hover:bg-ink-200 transition-colors"
            >
              Browse Products
            </Link>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-sm font-medium hover:bg-rose-100 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value }) {
  return (
    <div className="bg-ink-50 rounded-xl px-4 py-3">
      <dt className="text-xs text-ink-500 mb-0.5">{label}</dt>
      <dd className="text-sm font-medium text-ink-800">{value ?? "—"}</dd>
    </div>
  );
}

