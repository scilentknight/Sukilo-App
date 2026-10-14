"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCountry } from "@/context/CountryContext";
import { useLocale } from "@/context/LocaleContext";
import { confirmIdentifierChange, startIdentifierChange, verifyCode } from "@/lib/account";
import { normalizePhone } from "@/schemas/auth";
import { identifierChangeSchema } from "@/schemas/account";
import {
  AccountShell,
  FormMessage,
  RecentSignInGate,
  Section,
  loginHref,
  signOutLocally,
} from "./AccountShell";
import { CodeForm } from "./VerifiedAction";

/** Stable `detail.code` values from the API's identifier-change errors. */
const CHANGE_ERRORS = {
  CUSTOMER_IDENTIFIER_CHANGE_UNAVAILABLE:
    "For your security, changing your email or phone needs a password sign-in from the last 5 minutes.",
  CUSTOMER_IDENTIFIER_CONFLICT: "That email or phone number can't be used. Try a different one.",
  CUSTOMER_IDENTIFIER_CHANGE_INVALID: "Check the email or phone number and try again.",
  CUSTOMER_IDENTIFIER_GRANT_INVALID: "That code has expired or was already used. Start again.",
};

function changeError(error) {
  const code = error?.body?.detail?.code;
  return { code, message: CHANGE_ERRORS[code] ?? error?.message };
}

/** Email / phone replacement: code to the new identifier, confirm, then sign in again. */
export function SecurityPanel() {
  const [exitHref, setExitHref] = useState(null);

  const signOutTo = async (href) => {
    setExitHref(href);
    await signOutLocally();
  };

  return (
    <AccountShell title="Security" exitHref={exitHref}>
      <Section
        title="Change email or phone"
        description="We send a code to the new address. After confirming, every device is signed out and you log in with the new details."
      >
        <RecentSignInGate
          maxAgeMinutes={5}
          action="changing your email or phone"
          onSignInAgain={() => signOutTo(loginHref("/account/security"))}
        >
          <IdentifierChange signOutTo={signOutTo} />
        </RecentSignInGate>
      </Section>
    </AccountShell>
  );
}

function IdentifierChange({ signOutTo }) {
  const { countryCode } = useCountry();
  const { language } = useLocale();
  const [pending, setPending] = useState(null);
  const [error, setError] = useState(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(identifierChangeSchema), defaultValues: { kind: "email" } });
  const kind = useWatch({ control, name: "kind" });

  const start = async (values) => {
    setError(null);
    const target = values.kind === "email" ? { email: values.email.trim() } : { phone: normalizePhone(values.phone) };
    try {
      const challengeId = await startIdentifierChange({ ...target, countryCode, localeCode: language });
      setPending({ challengeId, kind: values.kind, target });
    } catch (err) {
      setError(changeError(err));
    }
  };

  const confirm = async (code) => {
    const grant = await verifyCode({
      challengeId: pending.challengeId,
      purpose: pending.kind === "email" ? "VERIFY_EMAIL" : "VERIFY_PHONE",
      code,
    });
    try {
      await confirmIdentifierChange({ grant, ...pending.target, countryCode, localeCode: language });
    } catch (err) {
      throw new Error(changeError(err).message);
    }
    await signOutTo("/login?notice=identifier-changed");
  };

  if (pending) {
    const destination = pending.target.email ?? pending.target.phone;
    return (
      <CodeForm
        hint={`Enter the 6-digit code sent to ${destination}.`}
        submitLabel="Confirm change"
        onSubmit={confirm}
        onCancel={() => setPending(null)}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(start)} className="mt-4 flex flex-col gap-3" noValidate>
      <fieldset className="flex gap-4 text-sm text-ink-700">
        <legend className="sr-only">What to change</legend>
        <label className="flex items-center gap-2">
          <input type="radio" value="email" {...register("kind")} /> Email
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" value="phone" {...register("kind")} /> Phone
        </label>
      </fieldset>
      {kind === "email" ? (
        <Input label="New email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
      ) : (
        <Input
          label="New phone"
          type="tel"
          autoComplete="tel"
          placeholder="+9779812345678"
          error={errors.phone?.message}
          {...register("phone")}
        />
      )}
      <FormMessage error={error?.message} />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" isLoading={isSubmitting}>
          Send code
        </Button>
        {error?.code === "CUSTOMER_IDENTIFIER_CHANGE_UNAVAILABLE" ? (
          <Button type="button" variant="outline" onClick={() => signOutTo(loginHref("/account/security"))}>
            Sign in again
          </Button>
        ) : null}
      </div>
    </form>
  );
}
