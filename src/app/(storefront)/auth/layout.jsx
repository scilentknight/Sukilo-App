"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LoadingSpinner } from "@/components/ui";

const EASE = "ease-[cubic-bezier(0.65,0,0.35,1)]";
const ROUTES = { login: "/auth/login", register: "/auth/register" };
const EXIT_MS = 300; // form fade-out before the route changes

/* ------------------------- Desktop overlay copy -------------------------- */
function OverlayCopy({ active, title, text, cta, onClick }) {
  return (
    <div
      aria-hidden={!active}
      className={`col-start-1 row-start-1 transition-all duration-500 ${EASE} ${
        active
          ? "visible translate-y-0 opacity-100 delay-200"
          : "invisible translate-y-3 opacity-0"
      }`}
    >
      <h2 className="max-w-xs text-3xl font-bold leading-tight">{title}</h2>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/70">
        {text}
      </p>
      <button
        type="button"
        onClick={onClick}
        tabIndex={active ? 0 : -1}
        className="mt-7 rounded-lg border border-white/40 px-6 py-2.5 text-sm font-semibold transition-colors hover:bg-white hover:text-ink-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        {cta}
      </button>
    </div>
  );
}

/* ------------------------- Shared shell (persists) ------------------------ */
export default function AuthLayout({ children }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const checkedOnce = useRef(false);
  const routeMode = pathname.startsWith(ROUTES.register) ? "register" : "login";
  const [mode, setMode] = useState(routeMode);
  const [leaving, setLeaving] = useState(false);
  const timer = useRef(null);
  const isLogin = mode === "login";

  useEffect(() => {
    setMode(routeMode);
    setLeaving(false);
  }, [routeMode]);

  useEffect(() => {
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

  useEffect(() => {
    router.prefetch(ROUTES.login);
    router.prefetch(ROUTES.register);
    return () => clearTimeout(timer.current);
  }, [router]);

  function switchTo(next) {
    if (next === mode) return;
    clearTimeout(timer.current);
    setMode(next);

    // Clicked back to the page we are still on: just cancel the change.
    if (next === routeMode) {
      setLeaving(false);
      return;
    }

    setLeaving(true);
    const nextParam = new URLSearchParams(window.location.search).get("next");
    const qs = nextParam ? `?next=${encodeURIComponent(nextParam)}` : "";
    timer.current = setTimeout(
      () => router.push(`${ROUTES[next]}${qs}`),
      EXIT_MS,
    );
  }

  if (isLoading || user) {
    return (
      <div className="min-h-[60vh]">
        <LoadingSpinner message="Taking you back…" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4 py-10">
      <div
        className={`relative w-full max-w-md overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm lg:flex lg:max-w-5xl lg:items-center lg:transition-[min-height] lg:duration-700 motion-reduce:transition-none ${EASE} ${
          isLogin ? "lg:min-h-[460px]" : "lg:min-h-[660px]"
        }`}
      >
        {/* Mobile / tablet: wordmark + segmented toggle */}
        <div className="px-6 pt-6 sm:px-10 lg:hidden">
          <p className="mb-4 text-lg font-bold tracking-tight text-ink-800">
            Sukilo
          </p>
          <div
            role="tablist"
            aria-label="Account"
            className="relative grid grid-cols-2 rounded-xl bg-ink-50 p-1"
          >
            <span
              aria-hidden="true"
              className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-lg bg-white shadow-sm transition-transform duration-500 motion-reduce:transition-none ${EASE} ${
                isLogin ? "translate-x-0" : "translate-x-full"
              }`}
            />
            {[
              ["login", "Sign in"],
              ["register", "Create account"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={mode === key}
                onClick={() => switchTo(key)}
                className={`relative z-10 rounded-lg py-2 text-sm font-medium transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ${
                  mode === key ? "text-ink-800" : "text-ink-500"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Form panel: slides left/right on desktop, current page renders here */}
        <div
          className={`w-full lg:w-1/2 lg:transition-transform lg:duration-700 motion-reduce:transition-none ${EASE} ${
            isLogin ? "lg:translate-x-0" : "lg:translate-x-full"
          }`}
        >
          <div
            aria-busy={leaving}
            className={`px-6 py-8 transition-opacity motion-reduce:transition-none sm:px-10 ${EASE} ${
              leaving
                ? "pointer-events-none opacity-0 duration-300"
                : "opacity-100 duration-500 delay-200"
            }`}
          >
            {children}

            <p className="mt-6 text-center text-sm text-ink-500 lg:hidden">
              {isLogin ? "New to Sukilo? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => switchTo(isLogin ? "register" : "login")}
                className="font-medium text-brand-600 hover:text-brand-700"
              >
                {isLogin ? "Create an account" : "Sign in"}
              </button>
            </p>
          </div>
        </div>

        {/* Desktop: sliding image overlay */}
        <aside
          className={`absolute left-1/2 top-0 hidden h-full w-1/2 overflow-hidden bg-ink-800 text-white transition-transform duration-700 motion-reduce:transition-none lg:block ${EASE} ${
            isLogin ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {[
            ["/images/auth-login.svg", isLogin],
            ["/images/auth-register.svg", !isLogin],
          ].map(([src, active]) => (
            <Image
              key={src}
              src={src}
              alt=""
              fill
              priority
              unoptimized
              sizes="50vw"
              className={`object-cover transition-opacity duration-700 ${
                active ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-ink-800/70 via-transparent to-ink-800/30"
          />

          <div className="relative flex h-full flex-col justify-end p-12">
            <div className="grid">
              <OverlayCopy
                active={isLogin}
                title="New to Sukilo?"
                text="Create an account to save your details, track your orders and check out faster."
                cta="Create an account"
                onClick={() => switchTo("register")}
              />
              <OverlayCopy
                active={!isLogin}
                title="Already have an account?"
                text="Sign in to pick up right where you left off."
                cta="Sign in"
                onClick={() => switchTo("login")}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
