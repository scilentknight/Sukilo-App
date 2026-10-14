"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { verifyCode } from "@/lib/account";
import { otpSchema } from "@/schemas/auth";
import { passwordConfirmSchema } from "@/schemas/account";
import { FormMessage } from "./AccountShell";

/** Six-digit code entry shared by every emailed-code confirmation. */
export function CodeForm({ hint, submitLabel = "Confirm", onSubmit, onCancel }) {
  const [error, setError] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(otpSchema) });

  const submit = async ({ code }) => {
    setError(null);
    try {
      await onSubmit(code);
    } catch (err) {
      setError(err?.message || "That code could not be verified.");
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="mt-3 flex flex-col gap-3" noValidate>
      {hint ? <p className="text-sm text-ink-600">{hint}</p> : null}
      <Input
        label="6-digit code"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        error={errors.code?.message}
        {...register("code")}
      />
      <FormMessage error={error} />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}

/**
 * Password, then emailed code, then `onGrant(grant, password)`. Used for every
 * API action that needs a fresh password check plus OTP (step-up, data export).
 * `requestCode(password)` must resolve to the challenge id.
 */
export function VerifiedAction({
  requestCode,
  purpose,
  actionClass,
  onGrant,
  startLabel = "Continue",
  confirmLabel = "Confirm",
  codeHint = "Enter the 6-digit code we just emailed you.",
  onCancel,
}) {
  const [challenge, setChallenge] = useState(null);
  const [error, setError] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(passwordConfirmSchema) });

  const submitPassword = async ({ password }) => {
    setError(null);
    try {
      setChallenge({ id: await requestCode(password), password });
    } catch (err) {
      setError(err?.status === 401 ? "That password is incorrect." : err?.message);
    }
  };

  const submitCode = async (code) => {
    const grant = await verifyCode({ challengeId: challenge.id, purpose, code, actionClass });
    await onGrant(grant, challenge.password);
  };

  if (challenge) {
    return (
      <CodeForm
        hint={codeHint}
        submitLabel={confirmLabel}
        onSubmit={submitCode}
        onCancel={() => {
          setChallenge(null);
          onCancel?.();
        }}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(submitPassword)} className="mt-3 flex flex-col gap-3" noValidate>
      <Input
        label="Current password"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <FormMessage error={error} />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" isLoading={isSubmitting}>
          {startLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
