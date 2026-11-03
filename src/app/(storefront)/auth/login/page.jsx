"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Alert } from "@/components/ui";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledEmail = searchParams.get("email") || "";
  const isVerified = searchParams.get("verified") === "1";

  const [form, setForm] = useState({
    identifier: prefilledEmail,
    password: "",
    countryCode: "NP",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
    setServerError(null);
  }

  function validate() {
    const errs = {};
    if (!form.identifier) errs.identifier = "Email is required";
    if (!form.password) errs.password = "Password is required";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    setServerError(null);
    try {
      await login({
        identifier: form.identifier.trim(),
        password: form.password,
        countryCode: form.countryCode.trim().toUpperCase(),
      });
      const next = searchParams.get("next");
      const target =
        next && next.startsWith("/") && !next.startsWith("//")
          ? next
          : "/account";
      router.push(target);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink-800">Welcome back</h1>
        <p className="mt-1 text-sm text-ink-500">
          Sign in to your account to continue.
        </p>
      </div>

      {isVerified && (
        <Alert type="success" className="mb-5">
          ✅ Account verified! Please enter your password to sign in.
        </Alert>
      )}
      {serverError && (
        <Alert type="error" className="mb-5">
          {serverError}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="Email address"
          type="email"
          value={form.identifier}
          onChange={(e) => setField("identifier", e.target.value)}
          placeholder="you@example.com"
          error={errors.identifier}
          autoComplete="email"
          required
        />
        <div>
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setField("password", e.target.value)}
            placeholder="Your password"
            error={errors.password}
            autoComplete="current-password"
            required
          />
          <div className="mt-1 text-right">
            <Link
              href="/auth/forgot-password"
              className="text-xs text-brand-600 hover:text-brand-700"
            >
              Forgot password?
            </Link>
          </div>
        </div>
        <Button
          type="submit"
          loading={loading}
          size="lg"
          className="mt-2 w-full"
        >
          Sign In
        </Button>
      </form>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
