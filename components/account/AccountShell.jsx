"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/context/AuthContext";
import { hasRecentPasswordSignIn, logout } from "@/lib/auth";
import { cn } from "@/lib/cn";

const SECTIONS = [
  { href: "/account", label: "Overview" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/preferences", label: "Preferences" },
  { href: "/account/security", label: "Security" },
  { href: "/account/privacy", label: "Privacy" },
];

export function loginHref(pathname) {
  const page = pathname.startsWith("/admin") ? "/admin/login" : "/login";
  return `${page}?callbackUrl=${encodeURIComponent(pathname)}`;
}

/**
 * Signed-in account layout: section tabs, title, and a redirect to login for
 * visitors. Pages that sign the user out on purpose set `exitHref` first, so
 * that destination wins over the generic login redirect.
 */
export function AccountShell({ title, actions, exitHref, children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useAuth();

  useEffect(() => {
    if (status === "anonymous") router.replace(exitHref ?? loginHref(pathname));
  }, [status, router, pathname, exitHref]);

  return (
    <div className="container-page max-w-3xl space-y-6 py-10">
      <nav aria-label="Account sections" className="-mx-1 flex gap-1 overflow-x-auto">
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            aria-current={pathname === section.href ? "page" : undefined}
            className={cn(
              "focus-ring whitespace-nowrap rounded-lg px-3 py-1.5 text-sm",
              pathname === section.href
                ? "bg-ink-900 font-medium text-white"
                : "text-ink-600 hover:bg-ink-100",
            )}
          >
            {section.label}
          </Link>
        ))}
      </nav>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">{title}</h1>
        {status === "authenticated" ? actions : null}
      </div>
      {status === "authenticated" ? children : <AccountSkeleton />}
    </div>
  );
}

/**
 * Shows `children` only while the session comes from a password login newer
 * than `maxAgeMinutes`, as the API requires; otherwise offers to sign in again.
 */
export function RecentSignInGate({ maxAgeMinutes, action, onSignInAgain, children }) {
  const [recent] = useState(() => hasRecentPasswordSignIn(maxAgeMinutes * 60_000));
  if (recent) return children;
  return (
    <div className="mt-3 space-y-3">
      <p className="text-sm text-ink-600">
        For your security, {action} needs a password sign-in from the last {maxAgeMinutes} minutes.
      </p>
      <Button type="button" variant="outline" onClick={onSignInAgain}>
        Sign in again
      </Button>
    </div>
  );
}

/** Ends the local session; the shell then navigates to the page's `exitHref`. */
export async function signOutLocally() {
  try {
    await logout();
  } catch {
    // The local session is cleared even if the server call fails.
  }
}

export function AccountSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

export function Section({ title, description, children, className }) {
  return (
    <section className={cn("rounded-xl border border-ink-200 bg-white p-5", className)}>
      <h2 className="text-sm font-semibold text-ink-900">{title}</h2>
      {description ? <p className="mt-1 text-sm text-ink-500">{description}</p> : null}
      {children}
    </section>
  );
}

export function FormMessage({ error, success }) {
  if (error) {
    return (
      <p role="alert" className="text-sm text-rose-600">
        {error}
      </p>
    );
  }
  if (success) {
    return (
      <p role="status" className="text-sm text-emerald-700">
        {success}
      </p>
    );
  }
  return null;
}
