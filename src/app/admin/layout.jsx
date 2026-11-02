"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AdminShell from "@/components/admin/AdminShell";
import { LoadingSpinner } from "@/components/ui";

export default function AdminLayout({ children }) {
  const { user, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!isAdmin) router.replace("/account");
  }, [user, isAdmin, isLoading, pathname, router]);

  if (isLoading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-ink-50">
        <LoadingSpinner message="Checking admin access…" />
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
