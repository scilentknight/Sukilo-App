"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { verifyOtp, resendOtp } from "@/lib/api";

const RESEND_COOLDOWN = 60;

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email) {
      setError("Email address is missing.");
      return;
    }
    if (otp.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    try {
      await verifyOtp({ email, otp });
      setSuccess("Email verified successfully!");
      setTimeout(() => router.push("/login"), 1000);
    } catch (err: any) {
      setError(err?.message || "Invalid verification code.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    setError(null);
    setSuccess(null);
    setIsResending(true);
    try {
      await resendOtp({ email });
      setSuccess("A new verification code has been sent.");
      setCooldown(RESEND_COOLDOWN);
    } catch (err: any) {
      setError(err?.message || "Failed to resend code.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <Logo showText={false} iconSize={48} className="mx-auto" />

      <h1 className="mt-4 text-center text-2xl font-bold tracking-tight text-gray-900">
        Verify your email
      </h1>
      <p className="mt-2 text-center text-sm text-gray-500">
        We sent a 6-digit verification code to
      </p>
      <p className="mt-1 text-center text-sm font-medium text-gray-900">
        {email}
      </p>

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-soft">
        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="otp"
              className="mb-2 flex items-center justify-between text-sm font-medium text-gray-700"
            >
              <span>Verification Code</span>
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending || isLoading || cooldown > 0}
                className="text-primary-600 hover:text-primary-700 disabled:opacity-50"
              >
                {isResending
                  ? "Sending..."
                  : cooldown > 0
                    ? `Resend in ${cooldown}s`
                    : "Resend code"}
              </button>
            </label>

            <input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="Enter 6-digit code"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-xl tracking-[0.4em] outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          {error && <p className="text-center text-sm text-red-600">{error}</p>}
          {success && (
            <p className="text-center text-sm text-green-600">{success}</p>
          )}

          <Button
            type="submit"
            size="lg"
            isLoading={isLoading}
            disabled={otp.length !== 6}
          >
            Verify Email
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary-600 hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <VerifyOtpForm />
    </Suspense>
  );
}
