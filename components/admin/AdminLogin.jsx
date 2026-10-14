"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { useCountry } from "@/context/CountryContext";
import { destinationForRoles, listOwnRoles } from "@/lib/access";
import { login } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { usePersistentStore } from "@/lib/persistent-store";
import { loginSchema, normalizePhone } from "@/schemas/auth";
import { adminThemeStore } from "./theme";

/** Only an admin path is a valid destination after this form. */
function adminCallback(raw) {
  if (!raw || !raw.startsWith("/admin") || raw.startsWith("//") || raw.startsWith("/admin/login")) {
    return "/admin";
  }
  return raw;
}

/**
 * Credential login for the admin panel. Uses the same `POST /api/v1/auth/login`
 * as the storefront; each admin API still decides what this account may do.
 */
export function AdminLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useAuth();
  const { countries, countryCode, setCountry } = useCountry();
  const darkMode = usePersistentStore(adminThemeStore) === "dark";
  const callbackUrl = adminCallback(searchParams.get("callbackUrl"));
  const [formError, setFormError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (status !== "authenticated") return undefined;
    let cancelled = false;
    (async () => {
      try {
        const access = await listOwnRoles();
        if (!Array.isArray(access?.roles)) {
          throw new Error("Could not load your account role.");
        }
        if (!cancelled) router.replace(destinationForRoles(access.roles, callbackUrl));
      } catch (error) {
        if (!cancelled) setFormError(error.message || "Could not load your account role.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, router, callbackUrl]);

  const onSubmit = async ({ identifier, password }) => {
    setFormError(null);
    try {
      await login({
        identifier: identifier.includes("@") ? identifier : normalizePhone(identifier),
        password,
        countryCode,
        deviceName: "Admin panel",
      });
    } catch (error) {
      setFormError(
        error.status === 401
          ? "Invalid email, phone number or password."
          : error.message || "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <div className={cn("flex min-h-screen items-center justify-center bg-ink-100 px-4 py-12 dark:bg-slate-950", darkMode && "dark")}>
      <div className="w-full max-w-md rounded-2xl border border-ink-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            S
          </span>
          <div>
            <p className="text-sm font-bold leading-tight text-ink-900">Sukilo</p>
            <p className="text-[11px] uppercase tracking-wide text-ink-400">Admin panel</p>
          </div>
        </div>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-ink-900">Sign in</h1>
        <p className="mt-1 text-sm text-ink-500">Use your Sukilo email or phone and password.</p>

        {status === "authenticated" && !formError ? (
          <p role="status" className="mt-6 text-sm text-ink-500">
            Checking your role…
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
            <Input
              label="Email or phone"
              type="text"
              autoComplete="username"
              error={errors.identifier?.message}
              {...register("identifier")}
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                error={errors.password?.message}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((shown) => !shown)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="focus-ring absolute right-2 top-8 rounded-md p-1.5 text-ink-400 hover:text-ink-700"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="admin-market" className="text-sm font-medium leading-5 text-gray-700">
                Market
              </label>
              <select
                id="admin-market"
                value={countryCode}
                onChange={(event) => setCountry(event.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900"
              >
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.name}
                  </option>
                ))}
              </select>
            </div>
            {formError ? (
              <p role="alert" className="text-sm text-rose-600">
                {formError}
              </p>
            ) : null}
            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Sign in
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-ink-500">
          <Link href="/forgot-password" className="focus-ring rounded text-brand-600 hover:underline">
            Forgot password?
          </Link>
          <span className="mx-2 text-ink-300">·</span>
          <Link href="/" className="focus-ring rounded hover:underline">
            Back to store
          </Link>
        </p>
      </div>
    </div>
  );
}
