"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import {
  verifyRegistration,
  verifyPasswordResetCode,
  resendRegistrationOtp,
} from "@/lib/auth";

import Button from "@/components/ui/Button";
import { Alert } from "@/components/ui";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const OTP_TTL_SECONDS = 900;
const RESEND_INTERVAL_SECONDS = 30;

function isValidUuid(value) {
  return typeof value === "string" && UUID_REGEX.test(value.trim());
}

function formatTime(seconds) {
  if (seconds <= 0) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawChallengeId = searchParams.get("challenge_id") || "";
  const purpose = searchParams.get("purpose") || "REGISTER";
  const emailParam = searchParams.get("email") || "";
  const tsParam = parseInt(searchParams.get("ts") || "0", 10);

  // Session state
  const [storedChallengeId, setStoredChallengeId] = useState("");
  const [storedEmail, setStoredEmail] = useState("");
  const [storedTs, setStoredTs] = useState(0);

  // OTP state
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Timer state
  const [secondsLeft, setSecondsLeft] = useState(OTP_TTL_SECONDS);
  const [resendSecondsLeft, setResendSecondsLeft] = useState(
    RESEND_INTERVAL_SECONDS
  );
  const [expired, setExpired] = useState(false);

  // Challenge state
  const [resendChallengeId, setResendChallengeId] = useState("");
  const [resendIssueTs, setResendIssueTs] = useState(0);

  // Resend availability timestamp
  const [resendAvailableAt, setResendAvailableAt] = useState(0);

  const timerRef = useRef(null);
  const resendTimerRef = useRef(null);
  const inputRef = useRef(null);

  // Resolve active challenge
  const activeChallengeId =
    resendChallengeId ||
    (isValidUuid(rawChallengeId) ? rawChallengeId : storedChallengeId);

  const activeEmail = emailParam || storedEmail;

  const issueTs = resendIssueTs || tsParam || storedTs;

  // Restore verification session
  useEffect(() => {
    const challengeId = sessionStorage.getItem(
      "sukilo_last_challenge_id"
    );

    const email = sessionStorage.getItem("sukilo_reg_email");

    const timestamp = parseInt(
      sessionStorage.getItem("sukilo_otp_ts") || "0",
      10
    );

    if (challengeId && isValidUuid(challengeId)) {
      setStoredChallengeId(challengeId);
    }

    if (email) {
      setStoredEmail(email);
    }

    if (timestamp) {
      setStoredTs(timestamp);
    }

    // Initial 30-second resend cooldown
    setResendAvailableAt(Date.now() + RESEND_INTERVAL_SECONDS * 1000);
  }, []);

  // OTP expiration countdown
  useEffect(() => {
    if (!issueTs) return;

    const updateOtpTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const elapsed = Math.max(0, now - issueTs);

      const remaining = Math.max(0, OTP_TTL_SECONDS - elapsed);

      setSecondsLeft(remaining);
      setExpired(remaining <= 0);
    };

    updateOtpTimer();

    timerRef.current = setInterval(updateOtpTimer, 1000);

    return () => {
      clearInterval(timerRef.current);
    };
  }, [issueTs]);

  // Resend countdown
  useEffect(() => {
    if (!resendAvailableAt) return;

    const updateResendTimer = () => {
      const remaining = Math.max(
        0,
        Math.ceil((resendAvailableAt - Date.now()) / 1000)
      );

      setResendSecondsLeft(remaining);
    };

    updateResendTimer();

    resendTimerRef.current = setInterval(updateResendTimer, 1000);

    return () => {
      clearInterval(resendTimerRef.current);
    };
  }, [resendAvailableAt]);

  // Focus OTP input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Verify OTP
  async function handleSubmit(e) {
    e.preventDefault();

    if (loading || resending) return;

    if (expired) {
      setError("This OTP has expired. Please request a new code.");
      return;
    }

    const finalChallengeId = activeChallengeId?.trim();

    if (!finalChallengeId || !isValidUuid(finalChallengeId)) {
      setError(
        "Verification session is missing. Please register again."
      );
      return;
    }

    const cleanCode = code.trim();

    if (!/^\d{6}$/.test(cleanCode)) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (purpose === "REGISTER") {
        await verifyRegistration({
          challengeId: finalChallengeId,
          code: cleanCode,
        });

        setSuccess(true);

        clearInterval(timerRef.current);
        clearInterval(resendTimerRef.current);

        sessionStorage.removeItem("sukilo_last_challenge_id");
        sessionStorage.removeItem("sukilo_reg_email");
        sessionStorage.removeItem("sukilo_otp_ts");

        setTimeout(() => {
          const target = activeEmail
            ? `/auth/login?email=${encodeURIComponent(activeEmail)}&verified=1`
            : "/auth/login?verified=1";

          router.push(target);
        }, 1500);
      } else if (purpose === "RESET") {
        const grant = await verifyPasswordResetCode({
          challengeId: finalChallengeId,
          code: cleanCode,
        });

        sessionStorage.removeItem("sukilo_last_challenge_id");
        sessionStorage.removeItem("sukilo_reg_email");
        sessionStorage.removeItem("sukilo_otp_ts");

        router.push(
          `/auth/reset-password?grant=${encodeURIComponent(grant)}`
        );
      } else {
        throw new Error("Unsupported OTP verification purpose.");
      }
    } catch (err) {
      const message = err.message || "";

      if (
        message.toLowerCase().includes("unavailable") ||
        message.toLowerCase().includes("expired")
      ) {
        setError(
          "This OTP has expired or was already used. Please request a new one."
        );
      } else if (message.toLowerCase().includes("invalid")) {
        setError(
          "The code you entered is incorrect. Please check your email and try again."
        );
      } else {
        setError(message || "Failed to verify code. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Resend OTP
  async function handleResendOtp() {
    if (
      resendSecondsLeft > 0 ||
      resending ||
      loading ||
      purpose !== "REGISTER"
    ) {
      return;
    }

    if (!activeChallengeId || !isValidUuid(activeChallengeId)) {
      setError("Verification session is missing. Please register again.");
      return;
    }

    setResending(true);
    setError(null);

    try {
      const data = await resendRegistrationOtp({
        challengeId: activeChallengeId,
      });

      if (!data?.challenge_id || !isValidUuid(data.challenge_id)) {
        throw new Error(
          "The server did not return a valid OTP challenge."
        );
      }

      const newTimestamp = Math.floor(Date.now() / 1000);

      // Replace old challenge
      setResendChallengeId(data.challenge_id);
      setResendIssueTs(newTimestamp);

      // Clear previous OTP
      setCode("");

      // Reset expiry
      setExpired(false);
      setSecondsLeft(OTP_TTL_SECONDS);

      // Start another 30-second cooldown
      setResendAvailableAt(
        Date.now() + RESEND_INTERVAL_SECONDS * 1000
      );

      // Save new challenge
      sessionStorage.setItem(
        "sukilo_last_challenge_id",
        data.challenge_id
      );

      sessionStorage.setItem(
        "sukilo_otp_ts",
        String(newTimestamp)
      );

      // Update URL
      const params = new URLSearchParams(window.location.search);

      params.set("challenge_id", data.challenge_id);
      params.set("ts", String(newTimestamp));

      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}?${params.toString()}`
      );

      inputRef.current?.focus();
    } catch (err) {
      setError(
        err.message || "Unable to resend OTP. Please try again."
      );
    } finally {
      setResending(false);
    }
  }

  const timerColor =
    secondsLeft > 120
      ? "text-green-600"
      : secondsLeft > 60
        ? "text-amber-500"
        : "text-red-500";

  const backLink =
    purpose === "REGISTER"
      ? "/auth/register"
      : "/auth/forgot-password";

  const backLabel =
    purpose === "REGISTER"
      ? "Register again"
      : "Request a new code";

  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="text-3xl font-black text-brand-600 tracking-tight"
          >
            sukilo
          </Link>

          <div className="text-5xl mt-4 mb-3">📬</div>

          <h1 className="text-2xl font-bold text-ink-800">
            Verify your email
          </h1>

          <p className="text-ink-500 text-sm mt-2">
            Enter the 6-digit code sent to{" "}
            {activeEmail ? (
              <strong className="text-ink-700">
                {activeEmail}
              </strong>
            ) : (
              "your email"
            )}
            {purpose === "REGISTER"
              ? " to activate your account."
              : " to reset your password."}
          </p>
        </div>

        {/* Verification Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-ink-100 p-8">

          {success ? (
            <Alert type="success">
              ✅ Email verified! Redirecting to sign in…
            </Alert>
          ) : (
            <>
              {/* OTP expiration */}
              {activeChallengeId && (
                <div className="flex items-center justify-center gap-2 mb-5">
                  <span className="text-sm text-ink-500">
                    Code expires in
                  </span>

                  <span
                    className={`text-sm font-bold font-mono ${
                      expired ? "text-red-500" : timerColor
                    }`}
                  >
                    {expired ? "Expired" : formatTime(secondsLeft)}
                  </span>
                </div>
              )}

              {/* Expiration message */}
              {expired && !error && (
                <Alert type="error" className="mb-5">
                  ⏰ This OTP has expired. Please use the resend button
                  below to receive a fresh code.
                </Alert>
              )}

              {/* Error message */}
              {error && (
                <Alert type="error" className="mb-5">
                  {error}
                </Alert>
              )}

              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-5"
              >
                {/* OTP Input */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-ink-700">
                    6-Digit Code
                  </label>

                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={code}
                    onChange={(e) =>
                      setCode(
                        e.target.value.replace(/\D/g, "").slice(0, 6)
                      )
                    }
                    placeholder="000000"
                    autoComplete="one-time-code"
                    disabled={expired || loading || resending}
                    required
                    className="w-full rounded-lg border border-ink-200 px-4 py-3 text-center text-2xl font-mono font-bold tracking-[0.5em] text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
                  />
                </div>

                {/* Missing challenge */}
                {!activeChallengeId && (
                  <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                    <p className="font-semibold">
                      ⚠️ Verification Session Missing
                    </p>

                    <p>
                      No valid verification challenge was found.
                      Please register again.
                    </p>

                    <Link
                      href={backLink}
                      className="text-brand-600 font-semibold underline mt-1"
                    >
                      {backLabel}
                    </Link>
                  </div>
                )}

                {/* Verify button */}
                <Button
                  type="submit"
                  loading={loading}
                  disabled={
                    !activeChallengeId ||
                    expired ||
                    resending
                  }
                  size="lg"
                  className="w-full"
                >
                  Verify Code
                </Button>

                {/* Resend button - registration only */}
                {purpose === "REGISTER" && (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={
                      resendSecondsLeft > 0 ||
                      resending ||
                      loading ||
                      !activeChallengeId
                    }
                    className="w-full rounded-lg border border-brand-200 px-4 py-3 text-sm font-semibold text-brand-600 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {resending
                      ? "Sending new code..."
                      : resendSecondsLeft > 0
                        ? `Resend OTP in ${formatTime(resendSecondsLeft)}`
                        : "Resend OTP"}
                  </button>
                )}
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-ink-500">
          Didn't get the code or code expired?{" "}
          <Link
            href={backLink}
            className="text-brand-600 hover:text-brand-700 font-medium"
          >
            {backLabel}
          </Link>
        </div>

        <div className="text-center mt-3 text-xs text-ink-400">
          The code is valid for 15 minutes. Check your spam folder if
          you don't see it.
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Loading…
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}