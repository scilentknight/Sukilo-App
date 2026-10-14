"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { loginSchema, normalizePhone } from "@/schemas/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { useCountry } from "@/context/CountryContext";
import { destinationForRoles, listOwnRoles } from "@/lib/access";
import { login } from "@/lib/auth";

const NOTICES = {
  registered: "Your account is verified. Log in to continue.",
  reset: "Your password was reset. Log in with your new password.",
  "identifier-changed": "Your sign-in details were updated and every device was signed out. Log in again.",
  closed: "Your account has been closed.",
};

/** Only same-origin relative paths are allowed as post-login destinations. */
function safeCallback(raw) {
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { countryCode } = useCountry();
  const callbackUrl = safeCallback(searchParams.get("callbackUrl"));
  const notice = NOTICES[searchParams.get("notice")];

  const [formError, setFormError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async ({ identifier, password }) => {
    setFormError(null);
    try {
      await login({
        identifier: identifier.includes("@") ? identifier : normalizePhone(identifier),
        password,
        countryCode,
      });
      const access = await listOwnRoles();
      if (!Array.isArray(access?.roles)) {
        throw new Error("Could not load your account role.");
      }
      router.replace(destinationForRoles(access.roles, callbackUrl));
    } catch (error) {
      setFormError(
        error.status === 401
          ? "Invalid email, phone number or password."
          : error.message || "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <Logo showText={false} iconSize={88} className="mx-auto" />

      <h1 className="mt-1 text-center text-2xl font-bold tracking-tight text-gray-900">
        Welcome back
      </h1>

      <p className="mt-2 text-center text-sm text-gray-500">Log in to continue to SUKILO</p>

      {notice ? (
        <p
          role="status"
          className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          {notice}
        </p>
      ) : null}

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-soft">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <Input
            label="Email or phone"
            autoComplete="username"
            placeholder=""
            error={errors.identifier?.message}
            {...register("identifier")}
          />

          <div className="flex flex-col gap-1.5">
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                error={errors.password?.message}
                className="pr-10"
                {...register("password")}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-[38px] text-gray-500 transition-colors hover:text-gray-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <Link
              href="/forgot-password"
              className="self-end text-xs font-medium text-primary-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {formError && (
            <p role="alert" className="text-sm text-red-600">
              {formError}
            </p>
          )}

          <Button type="submit" size="lg" isLoading={isSubmitting}>
            Log In
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-primary-600 hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <LoginForm />
    </Suspense>
  );
}
