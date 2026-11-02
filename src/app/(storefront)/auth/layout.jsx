"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LoadingSpinner } from "@/components/ui";

/** Sends already signed-in visitors back out of the login/register flows. */
export default function AuthLayout({ children }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const checkedOnce = useRef(false);

  useEffect(() => {
    // Wait for the session check, then decide once. A sign-in that happens
    // later on this page is handled by the page itself.
    if (isLoading || checkedOnce.current) return;
    checkedOnce.current = true;
    if (!user) return;

    const next = new URLSearchParams(window.location.search).get("next");
    const fallback =
      next && next.startsWith("/") && !next.startsWith("//") ? next : "/";

    if (window.history.length > 1) {
      router.back();
    } else {
      router.replace(fallback);
    }
  }, [isLoading, user, router]);

  if (isLoading || user) {
    return (
      <div className="min-h-[60vh]">
        <LoadingSpinner message="Taking you back…" />
      </div>
    );
  }

  return children;
}
