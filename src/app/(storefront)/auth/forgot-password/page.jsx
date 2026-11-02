"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { requestPasswordReset } from "@/lib/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Alert } from "@/components/ui";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("NP");
  const [localeCode, setLocaleCode] = useState("en-US");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setServerError(null);

    try {
      const data = await requestPasswordReset({
        email: email.trim(),
        countryCode: countryCode.trim().toUpperCase(),
        localeCode: localeCode.trim(),
      });

      if (data?.challenge_id && typeof window !== "undefined") {
        const nowTs = Math.floor(Date.now() / 1000);
        sessionStorage.setItem("sukilo_last_challenge_id", data.challenge_id);
        sessionStorage.setItem("sukilo_otp_ts", String(nowTs));
      }

      const nowTs = Math.floor(Date.now() / 1000);
      const params = new URLSearchParams({
        challenge_id: data?.challenge_id || "",
        purpose: "RESET",
        email: email.trim(),
        ts: String(nowTs),
      });
      router.push(`/auth/verify-otp?${params.toString()}`);
    } catch (err) {
      setServerError(err.message);
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
          <h1 className="mt-4 text-2xl font-bold text-ink-800">Reset your password</h1>
          <p className="text-ink-500 text-sm mt-1">
            Enter your email and we&apos;ll send you a 6-digit reset code.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-ink-100 p-8">
          {serverError && <Alert type="error" className="mb-5">{serverError}</Alert>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Country Code"
                type="text"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                placeholder="NP"
                maxLength={2}
              />
              <Input
                label="Locale"
                type="text"
                value={localeCode}
                onChange={(e) => setLocaleCode(e.target.value)}
                placeholder="en-US"
              />
            </div>
            <Button type="submit" loading={loading} size="lg" className="w-full mt-2">
              Send Reset Code
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-ink-500 mt-6">
          Remember your password?{" "}
          <Link href="/auth/login" className="text-brand-600 hover:text-brand-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
