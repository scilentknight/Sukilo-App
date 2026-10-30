"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "@/lib/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Alert } from "@/components/ui";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    countryCode: "NP",
    localeCode: "en-US",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  }

  function validate() {
    const errs = {};
    if (!form.email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      errs.email = "Invalid email address";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 12)
      errs.password = "Password must be at least 12 characters";
    else if (form.password.length > 128)
      errs.password = "Password must be at most 128 characters";
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    if (!form.countryCode || form.countryCode.length !== 2)
      errs.countryCode = "2-letter country code required";
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
      const data = await register({
        email: form.email.trim(),
        password: form.password,
        phone: form.phone ? form.phone.trim() : null,
        countryCode: form.countryCode.trim().toUpperCase(),
        localeCode: form.localeCode.trim(),
      });

      // Only continue if backend returned a real challenge ID.
      if (!data?.challenge_id) {
        throw new Error("Unable to create verification challenge.");
      }

      const nowTs = Math.floor(Date.now() / 1000);

      sessionStorage.setItem("sukilo_last_challenge_id", data.challenge_id);

      sessionStorage.setItem("sukilo_reg_email", form.email.trim());

      sessionStorage.setItem("sukilo_otp_ts", String(nowTs));

      const params = new URLSearchParams({
        challenge_id: data.challenge_id,
        purpose: "REGISTER",
        email: form.email.trim(),
        ts: String(nowTs),
      });

      router.push(`/auth/verify-otp?${params.toString()}`);
    } catch (err) {
      setServerError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="text-3xl font-black text-brand-600 tracking-tight"
          >
            sukilo
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-ink-800">
            Create your account
          </h1>
          <p className="text-ink-500 text-sm mt-1">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-brand-600 hover:text-brand-700 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-ink-100 p-8">
          {serverError && (
            <Alert type="error" className="mb-5">
              {serverError}
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email address"
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="you@example.com"
              error={errors.email}
              autoComplete="email"
              required
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setField("password", e.target.value)}
              placeholder="At least 12 characters"
              error={errors.password}
              autoComplete="new-password"
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setField("confirmPassword", e.target.value)}
              placeholder="Repeat your password"
              error={errors.confirmPassword}
              autoComplete="new-password"
              required
            />
            <Input
              label="Phone (optional)"
              type="tel"
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              placeholder="+977XXXXXXXXXX"
              error={errors.phone}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Country Code"
                type="text"
                value={form.countryCode}
                onChange={(e) =>
                  setField("countryCode", e.target.value.toUpperCase())
                }
                placeholder="NP"
                maxLength={2}
                error={errors.countryCode}
              />
              <Input
                label="Locale"
                type="text"
                value={form.localeCode}
                onChange={(e) => setField("localeCode", e.target.value)}
                placeholder="en-US"
                error={errors.localeCode}
              />
            </div>
            <Button
              type="submit"
              loading={loading}
              size="lg"
              className="w-full mt-2"
            >
              Create Account
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-ink-400 mt-6">
          By creating an account you agree to our{" "}
          <a href="#" className="text-brand-600 hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-brand-600 hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
