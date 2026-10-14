"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, resetPasswordSchema } from "@/schemas/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { useCountry } from "@/context/CountryContext";
import { useLocale } from "@/context/LocaleContext";
import {
  requestPasswordReset,
  resendPasswordResetCode,
  resetPassword,
  verifyPasswordResetCode,
} from "@/lib/auth";

/**
 * Two-step reset: request an emailed code, then submit code + new password.
 * The API answers step one identically for unknown emails, so account
 * existence is never revealed.
 */
export default function ForgotPasswordPage() {
  const [request, setRequest] = useState(null);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <Logo showText={false} iconSize={48} className="mx-auto" />
      <h1 className="mt-4 text-center text-2xl font-bold tracking-tight text-gray-900">
        {request ? "Choose a new password" : "Forgot your password?"}
      </h1>
      <p className="mt-2 text-center text-sm text-gray-500">
        {request
          ? `If an account exists for ${request.email}, we've emailed it a 6-digit code.`
          : "Enter your email and we'll send you a reset code"}
      </p>

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-soft">
        {request ? (
          <ResetForm
            email={request.email}
            challengeId={request.challengeId}
            onResent={(challengeId) => setRequest((prev) => ({ ...prev, challengeId }))}
            onRestart={() => setRequest(null)}
          />
        ) : (
          <RequestForm onRequested={setRequest} />
        )}
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">
        Remembered your password?{" "}
        <Link href="/login" className="font-medium text-primary-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

function RequestForm({ onRequested }) {
  const { countryCode } = useCountry();
  const { language } = useLocale();
  const [formError, setFormError] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit({ email }) {
    setFormError(null);
    try {
      const { challenge_id: challengeId } = await requestPasswordReset({
        email,
        countryCode,
        localeCode: language,
      });
      onRequested({ email, challengeId });
    } catch (err) {
      setFormError(err?.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      {formError && (
        <p role="alert" className="text-sm text-red-600">
          {formError}
        </p>
      )}
      <Button type="submit" size="lg" isLoading={isSubmitting}>
        Send reset code
      </Button>
    </form>
  );
}

function ResetForm({ email, challengeId, onResent, onRestart }) {
  const router = useRouter();
  const { countryCode } = useCountry();
  const { language } = useLocale();
  const [formError, setFormError] = useState(null);
  const [resend, setResend] = useState({ busy: false, notice: null });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(resetPasswordSchema) });

  async function onResend() {
    if (resend.busy) return;
    setResend({ busy: true, notice: null });
    setFormError(null);
    try {
      const { challenge_id: nextChallengeId } = await resendPasswordResetCode({
        email,
        countryCode,
        localeCode: language,
      });
      onResent(nextChallengeId);
      setResend({ busy: false, notice: "If an account exists, a new code is on its way. Use the newest code." });
    } catch (err) {
      setResend({ busy: false, notice: null });
      setFormError(err?.message || "Could not send a new code. Please try again.");
    }
  }

  async function onSubmit({ code, password }) {
    setFormError(null);
    try {
      const grant = await verifyPasswordResetCode({ challengeId, code });
      await resetPassword({ grant, newPassword: password, localeCode: language });
      router.replace("/login?notice=reset");
    } catch (err) {
      setFormError(err?.message || "Could not reset your password. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <Input
        label="Reset code"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        error={errors.code?.message}
        {...register("code")}
      />
      <Input
        label="New password"
        type="password"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <Input
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
      {formError && (
        <p role="alert" className="text-sm text-red-600">
          {formError}
        </p>
      )}
      {resend.notice && (
        <p role="status" className="text-sm text-emerald-700">
          {resend.notice}
        </p>
      )}
      <Button type="submit" size="lg" isLoading={isSubmitting}>
        Reset password
      </Button>
      <Button type="button" variant="outline" onClick={onResend} isLoading={resend.busy} disabled={isSubmitting}>
        Resend code
      </Button>
      <button
        type="button"
        onClick={onRestart}
        className="text-xs font-medium text-primary-600 hover:underline"
      >
        Use a different email or request a new code
      </button>
    </form>
  );
}
