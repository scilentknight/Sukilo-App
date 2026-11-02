"use client";

import { useCallback, useEffect, useState } from "react";
import { KeyRound, ShieldCheck, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Alert } from "@/components/ui";
import { requestStepUp, verifyStepUp } from "@/lib/stepUp";

/**
 * Two-step confirmation used by sensitive admin actions.
 * Step 1 re-checks the password, step 2 verifies the emailed code.
 */
export default function StepUpDialog({
  open,
  onClose,
  actionClass,
  title = "Confirm this action",
  description = "For your security, verify your password and a one-time code.",
  confirmLabel = "Confirm",
  onVerified,
}) {
  const [step, setStep] = useState("password");
  const [password, setPassword] = useState("");
  const [challengeId, setChallengeId] = useState(null);
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleClose = useCallback(() => {
    setStep("password");
    setPassword("");
    setChallengeId(null);
    setCode("");
    setDevCode(null);
    setError(null);
    setBusy(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;
    function handleKeyDown(event) {
      if (event.key === "Escape" && !busy) handleClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, busy, handleClose]);

  async function handlePassword(event) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await requestStepUp(password, actionClass);
      setChallengeId(result.challenge_id);
      setDevCode(result.dev_code ?? null);
      setStep("code");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleCode(event) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await verifyStepUp(challengeId, code, actionClass);
      if (!result.grant) throw new Error("Verification failed. Please try again.");
      onVerified(result.grant);
      handleClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-4">
      <button
        type="button"
        aria-label="Close"
        onClick={handleClose}
        className="absolute inset-0 bg-ink-900/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-md rounded-xl border border-ink-200 bg-white p-5 shadow-2xl"
      >
        <div className="mb-4 flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
            {step === "password" ? <KeyRound size={19} /> : <ShieldCheck size={19} />}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-ink-900">{title}</h2>
            <p className="mt-0.5 text-sm text-ink-500">{description}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-500 hover:bg-ink-100"
          >
            <X size={17} />
          </button>
        </div>

        {error && (
          <div className="mb-4">
            <Alert type="error">{error}</Alert>
          </div>
        )}

        {step === "password" ? (
          <form onSubmit={handlePassword} className="space-y-4">
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              autoFocus
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" loading={busy} disabled={!password}>
                Send code
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCode} className="space-y-4">
            <Input
              label="One-time code"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              maxLength={6}
              pattern="^\d{6}$"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
              placeholder="6-digit code"
            />
            {devCode && (
              <p className="rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-500">
                Development code: <span className="font-mono font-semibold text-ink-800">{devCode}</span>
              </p>
            )}
            <p className="text-xs text-ink-500">
              The code is sent to the email address on your account.
            </p>
            <div className="flex justify-between gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep("password")}
                disabled={busy}
              >
                Back
              </Button>
              <Button type="submit" loading={busy} disabled={code.length !== 6}>
                {confirmLabel}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
