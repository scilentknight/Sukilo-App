"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { useLocale } from "@/context/LocaleContext";
import { getProfile, listSessions, revokeAllSessions, revokeSession } from "@/lib/account";
import { formatDate } from "@/lib/format";
import { AccountShell, AccountSkeleton, FormMessage, Section, signOutLocally } from "./AccountShell";
import { SessionList } from "./SessionList";
import { useAccountResource } from "./useAccountResource";

async function loadAccount() {
  const [profile, sessions] = await Promise.all([getProfile(), listSessions()]);
  return { profile, sessions };
}

/** Signed-in customer overview: masked profile, devices and sign-out. */
export function AccountOverview() {
  const { language } = useLocale();
  const account = useAccountResource(loadAccount);
  const [busy, setBusy] = useState(null);
  const [exitHref, setExitHref] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [notice, setNotice] = useState(null);

  const refreshSessions = async () => {
    const sessions = await listSessions();
    account.setData((prev) => ({ ...prev, sessions }));
  };

  const onRevoke = async (sessionId) => {
    if (busy) return;
    setBusy(sessionId);
    setActionError(null);
    setNotice(null);
    try {
      await revokeSession(sessionId);
      await refreshSessions();
    } catch (error) {
      setActionError(error.message);
    } finally {
      setBusy(null);
    }
  };

  const onRevokeOthers = async () => {
    if (busy) return;
    setBusy("others");
    setActionError(null);
    setNotice(null);
    try {
      await revokeAllSessions({ keepCurrent: true });
      await refreshSessions();
      setNotice("Every other device has been signed out.");
    } catch (error) {
      setActionError(error.message);
    } finally {
      setBusy(null);
    }
  };

  const onLogout = async () => {
    if (busy) return;
    setBusy("logout");
    setExitHref("/");
    await signOutLocally();
  };

  const signOut = (
    <Button type="button" variant="outline" onClick={onLogout} isLoading={busy === "logout"}>
      Sign out
    </Button>
  );

  return (
    <AccountShell title="Your account" actions={signOut} exitHref={exitHref}>
      {account.state === "loading" ? <AccountSkeleton /> : null}
      {account.state === "error" ? (
        <ErrorState title="Unable to load your account" message={account.error} onRetry={account.reload} />
      ) : null}
      {account.state === "ready" ? (
        <>
          <Section title="Profile">
            <ProfileDetails profile={account.data.profile} language={language} />
          </Section>

          <Section title="Signed-in devices">
            <div className="mt-2 space-y-2">
              <FormMessage error={actionError} success={notice} />
            </div>
            <SessionList
              sessions={account.data.sessions}
              busyId={busy}
              onRevoke={onRevoke}
              language={language}
            />
            {account.data.sessions.some((session) => !session.is_current) ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={onRevokeOthers}
                isLoading={busy === "others"}
                disabled={Boolean(busy)}
              >
                Sign out all other devices
              </Button>
            ) : null}
          </Section>
        </>
      ) : null}
    </AccountShell>
  );
}

function ProfileDetails({ profile, language }) {
  return (
    <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
      <Detail
        label="Email"
        value={profile.email_masked ?? "—"}
        note={profile.email_verified ? "Verified" : "Not verified"}
      />
      <Detail
        label="Phone"
        value={profile.phone_masked ?? "Not added"}
        note={profile.phone_masked ? (profile.phone_verified ? "Verified" : "Not verified") : null}
      />
      <Detail label="Member since" value={formatDate(profile.created_at, language)} />
      <Detail
        label="Last sign-in"
        value={profile.last_login_at ? formatDate(profile.last_login_at, language) : "—"}
      />
    </dl>
  );
}

function Detail({ label, value, note }) {
  return (
    <div>
      <dt className="text-xs text-ink-400">{label}</dt>
      <dd className="font-medium text-ink-800">
        {value}
        {note ? <span className="ml-2 text-xs font-normal text-ink-400">{note}</span> : null}
      </dd>
    </div>
  );
}
