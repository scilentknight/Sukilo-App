"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/lib/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Alert } from "@/components/ui";

function LoginContent() {
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
      router.push("/account");
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-black text-brand-600 tracking-tight">
            sukilo
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-ink-800">Sign in to your account</h1>
          <p className="text-ink-500 text-sm mt-1">
            New to Sukilo?{" "}
            <Link href="/auth/register" className="text-brand-600 hover:text-brand-700 font-medium">
              Create an account
            </Link>
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-ink-100 p-8">
          {isVerified && (
            <Alert type="success" className="mb-5">
              ✅ Account verified! Please enter your password to sign in.
            </Alert>
          )}
          {serverError && (
            <Alert type="error" className="mb-5">{serverError}</Alert>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              <div className="text-right mt-1">
                <Link href="/auth/forgot-password" className="text-xs text-brand-600 hover:text-brand-700">
                  Forgot password?
                </Link>
              </div>
            </div>
            <Button type="submit" loading={loading} size="lg" className="w-full mt-2">
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading…</div>}>
      <LoginContent />
    </Suspense>
  );
}
