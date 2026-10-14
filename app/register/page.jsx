"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";

import { getCountry, getLanguage } from "@/config/locales";
import { normalizePhone, registerSchema } from "@/schemas/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { useCountry } from "@/context/CountryContext";
import { useLocale } from "@/context/LocaleContext";
import { register as registerAccount } from "@/lib/auth";

const SELECT = "h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { countries, countryCode, setCountry } = useCountry();
  const { language, setLanguage } = useLocale();

  const [formError, setFormError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: searchParams.get("email") ?? "",
      phone: "",
      password: "",
      countryCode,
      localeCode: language,
    },
  });
  const selectedCountry = useWatch({ control, name: "countryCode" }) || countryCode;
  const languages = getCountry(selectedCountry).languages.map((code) => getLanguage(code));

  function onCountryChange(event) {
    const code = event.target.value;
    setCountry(code);
    const market = getCountry(code);
    if (!market.languages.includes(getValues("localeCode"))) {
      setValue("localeCode", market.defaultLanguage, { shouldValidate: true });
      setLanguage(market.defaultLanguage);
    }
  }

  async function onSubmit({ email, phone, password, countryCode: market, localeCode }) {
    setFormError(null);
    setCountry(market);
    setLanguage(localeCode);
    try {
      // The API always answers 202 (it never reveals whether an email is taken)
      // and emails a 6-digit code. Verification uses POST /api/v1/auth/otp/verify.
      const result = await registerAccount({
        email,
        phone: normalizePhone(phone) || null,
        password,
        countryCode: market,
        localeCode,
      });
      const challengeId = result.challenge_id;
      if (result.dev_code) {
        sessionStorage.setItem(`sukilo.dev-otp.${challengeId}`, result.dev_code);
      }
      const params = new URLSearchParams({ challenge: challengeId, email });
      router.push(`/otp-verify?${params.toString()}`);
    } catch (err) {
      setFormError(err?.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <Logo showText={false} iconSize={48} className="mx-auto" />

      <h1 className="mt-4 text-center text-2xl font-bold tracking-tight text-gray-900">
        Create your account
      </h1>

      <p className="mt-2 text-center text-sm text-gray-500">
        Shop and sell on SUKILO with one account
      </p>

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-soft">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
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
            placeholder=""
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
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <p className="-mt-2 text-xs text-gray-500">At least 12 characters.</p>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="countryCode" className="text-sm font-medium leading-5 text-gray-700">
              Market
            </label>
            <select
              id="countryCode"
              className={SELECT}
              aria-invalid={errors.countryCode ? "true" : "false"}
              {...register("countryCode", { onChange: onCountryChange })}
            >
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
            {errors.countryCode ? (
              <p className="text-xs text-red-600">{errors.countryCode.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="localeCode" className="text-sm font-medium leading-5 text-gray-700">
              Language
            </label>
            <select
              id="localeCode"
              className={SELECT}
              aria-invalid={errors.localeCode ? "true" : "false"}
              {...register("localeCode", {
                onChange: (event) => setLanguage(event.target.value),
              })}
            >
              {languages.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label}
                </option>
              ))}
            </select>
            {errors.localeCode ? (
              <p className="text-xs text-red-600">{errors.localeCode.message}</p>
            ) : null}
          </div>

          {formError && (
            <p role="alert" className="text-sm text-red-600">
              {formError}
            </p>
          )}

          <Button type="submit" size="lg" isLoading={isSubmitting}>
            Create Account
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <RegisterForm />
    </Suspense>
  );
}
