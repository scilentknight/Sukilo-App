"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Alert } from "@/components/ui";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const grant = searchParams.get("grant") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localeCode] = useState("en-US");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 12) { setError("Password must be at least 12 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (!grant) { setError("Invalid or expired reset link. Please request a new one."); return; }
    setLoading(true);
    setError(null);
    try {
      await resetPassword({ grant, newPassword: password, localeCode });
      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-black text-brand-600 tracking-tight">sukilo</Link>
          <h1 className="mt-4 text-2xl font-bold text-ink-800">Set a new password</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-ink-100 p-8">
          {success ? (
            <Alert type="success">
              ✅ Password reset successfully! Redirecting to sign in…
            </Alert>
          ) : (
            <>
              {error && <Alert type="error" className="mb-5">{error}</Alert>}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                  label="New Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 12 characters"
                  autoComplete="new-password"
                  required
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your new password"
                  autoComplete="new-password"
                  required
                />
                <Button type="submit" loading={loading} size="lg" className="w-full mt-2">
                  Reset Password
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading…</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

