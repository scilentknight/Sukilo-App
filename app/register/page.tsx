"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";

import { registerSchema, type RegisterInput } from "@/schemas/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { registerUser } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();

  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(values: RegisterInput) {
    setFormError(null);

    try {
      // Send phone as undefined instead of "" so FastAPI treats it as missing
      const payload = { ...values, phone: values.phone?.trim() || undefined };

      const json = await registerUser(payload);

      // Registration is pending email verification: do NOT log the user in here.
      if (json?.pendingVerification) {
        const email = json?.data?.email ?? values.email;
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
        return;
      }

      router.push("/login");
    } catch (err: any) {
      if (err?.status === 409) {
        setFormError("An account with this email already exists.");
      } else {
        // network errors and API errors already carry a readable message
        setFormError(err?.message || "Something went wrong. Please try again.");
      }
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <Logo showText={false} iconSize={48} className="mx-auto" />

      <h1 className="mt-4 text-center text-2xl font-bold tracking-tight text-gray-900">
        Create your account
      </h1>

      <p className="mt-2 text-center text-sm text-gray-500">
        Discover timeless jewellery for every occasion
      </p>

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-soft">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Full Name"
            autoComplete="name"
            error={errors.name?.message}
            {...register("name")}
          />

          <Input
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="Phone (optional)"
            type="tel"
            autoComplete="tel"
            error={errors.phone?.message}
            {...register("phone")}
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              error={errors.password?.message}
              className="pr-10"
              {...register("password")}
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-[38px] text-gray-500 transition-colors hover:text-gray-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <Button type="submit" size="lg" isLoading={isSubmitting}>
            Create Account
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
