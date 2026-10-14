"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { verifyRegistration } from "@/lib/auth";

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const challengeId = searchParams.get("challenge") || "";
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [devCode, setDevCode] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!challengeId) return;
    const stored = sessionStorage.getItem(`sukilo.dev-otp.${challengeId}`) || "";
    if (stored) {
      setDevCode(stored);
      setOtp(stored);
    }
  }, [challengeId]);

  async function handleVerify(e) {
    e.preventDefault();
    if (isLoading) return;
    setError(null);

    if (!challengeId) {
      setError("This verification link is incomplete. Please register again.");
      return;
    }
    if (otp.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    try {
      await verifyRegistration({ challengeId, code: otp });
      sessionStorage.removeItem(`sukilo.dev-otp.${challengeId}`);
      router.replace("/login?notice=registered");
    } catch (err) {
      setError(err?.message || "Invalid verification code.");
      setIsLoading(false);
    }
  }

  const registerAgainHref = email
    ? `/register?email=${encodeURIComponent(email)}`
    : "/register";

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <Logo showText={false} iconSize={48} className="mx-auto" />

      <h1 className="mt-4 text-center text-2xl font-bold tracking-tight text-gray-900">
        Verify your email
      </h1>
      <p className="mt-2 text-center text-sm text-gray-500">
        {devCode
          ? "This API has no mail server, so the verification code is shown here."
          : "If this email can be registered, we sent a 6-digit code to"}
      </p>
      <p className="mt-1 text-center text-sm font-medium text-gray-900">
        {email || "your email"}
      </p>

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-soft">
        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="otp"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Verification Code
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

          {devCode ? (
            <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-center text-sm text-amber-900">
              Your code is <span className="font-semibold tracking-widest">{devCode}</span>
            </p>
          ) : null}

          {error && (
            <p role="alert" className="text-center text-sm text-red-600">
              {error}
            </p>
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

        <p className="mt-4 text-center text-xs text-gray-500">
          Didn&apos;t get a code, or it expired?{" "}
          <Link
            href={registerAgainHref}
            className="font-medium text-primary-600 hover:underline"
          >
            Submit the registration form again
          </Link>{" "}
          to receive a new one.
        </p>
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
