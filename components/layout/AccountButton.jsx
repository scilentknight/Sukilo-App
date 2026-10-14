"use client";

import Link from "next/link";
import { UserIcon } from "@/components/ui/icons";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";

/** Header account entry: "Sign in" for visitors, "Account" once signed in. */
export function AccountButton() {
  const { isAuthenticated } = useAuth();
  const { t } = useLocale();

  return (
    <Link
      href={isAuthenticated ? "/account" : "/login"}
      className="focus-ring hidden h-10 items-center gap-2 rounded-lg px-2 text-sm text-ink-700 hover:bg-ink-100 sm:flex"
    >
      <UserIcon className="h-5 w-5" />
      <span className="hidden xl:inline">{isAuthenticated ? t("account") : "Sign in"}</span>
    </Link>
  );
}
