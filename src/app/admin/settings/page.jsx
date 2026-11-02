"use client";

import { useCallback, useState } from "react";
import { Bell, Laptop, ShieldCheck } from "lucide-react";
import {
  getProfile,
  listSessions,
  revokeOtherSessions,
  revokeSession,
  updatePreferences,
} from "@/lib/admin";
import useAdminQuery from "@/lib/useAdminQuery";
import {
  Avatar,
  Badge,
  Card,
  CardHeader,
  DetailRow,
  ErrorNote,
  PageHeader,
  StatusBadge,
} from "@/components/admin/ui";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Alert, Skeleton } from "@/components/ui";
import { formatDateTime } from "@/lib/format";

const EMPTY_PREFS = { country_code: "NP", locale_code: "en", currency_code: "NPR" };

export default function AdminSettingsPage() {
  const [notice, setNotice] = useState(null);
  const [actionError, setActionError] = useState(null);

  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [sessionBusy, setSessionBusy] = useState(false);

  const load = useCallback(
    () =>
      Promise.all([getProfile(), listSessions()]).then(
        ([profile, sessions]) => ({ profile, sessions }),
      ),
    [],
  );
  const { data, loading, error, refresh } = useAdminQuery(load);
  const profile = data?.profile;
  const sessions = data?.sessions ?? [];
  const preferences = profile?.preferences;
  const form = draft ?? {
    country_code: preferences?.country_code || EMPTY_PREFS.country_code,
    locale_code: preferences?.locale_code || EMPTY_PREFS.locale_code,
    currency_code: preferences?.currency_code || EMPTY_PREFS.currency_code,
  };

  async function handleSavePreferences(event) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await updatePreferences({
        country_code: form.country_code.toUpperCase(),
        locale_code: form.locale_code,
        currency_code: form.currency_code.toUpperCase(),
        expected_version: preferences?.version ?? null,
      });
      setNotice("Market preferences updated.");
      setDraft(null);
      refresh();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleRevoke(sessionId) {
    setSessionBusy(true);
    setActionError(null);
    try {
      await revokeSession(sessionId);
      setNotice("Session revoked.");
      refresh();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSessionBusy(false);
    }
  }

  async function handleRevokeOthers() {
    if (!window.confirm("Sign out of every other session?")) return;
    setSessionBusy(true);
    setActionError(null);
    try {
      await revokeOtherSessions();
      setNotice("Other sessions signed out.");
      refresh();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSessionBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Your admin profile, market preferences, and active sessions."
      />

      {notice && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {(error || actionError) && (
        <div className="mb-4">
          <ErrorNote
            message={error || actionError}
            onRetry={
              error
                ? () => {
                    setActionError(null);
                    refresh(true);
                  }
                : undefined
            }
          />
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      ) : (
        profile && (
          <div className="space-y-6">
            <Card id="profile">
              <CardHeader
                title="Profile"
                description="Contact details stay masked in the admin workspace."
                action={
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600">
                    <ShieldCheck size={16} />
                  </span>
                }
              />
              <div className="flex flex-col gap-6 p-5 sm:flex-row">
                <div className="flex items-center gap-3 sm:w-56 sm:flex-col sm:items-start">
                  <Avatar name={profile.email_masked} size="lg" />
                  <div>
                    <p className="text-sm font-semibold text-ink-900">
                      {profile.email_masked || "No email"}
                    </p>
                    <div className="mt-1">
                      <StatusBadge value={profile.status} />
                    </div>
                  </div>
                </div>
                <dl className="min-w-0 flex-1">
                  <DetailRow label="Phone">{profile.phone_masked || "—"}</DetailRow>
                  <DetailRow label="Email verified">
                    {profile.email_verified ? "Yes" : "No"}
                  </DetailRow>
                  <DetailRow label="Phone verified">
                    {profile.phone_verified ? "Yes" : "No"}
                  </DetailRow>
                  <DetailRow label="Joined">{formatDateTime(profile.created_at)}</DetailRow>
                  <DetailRow label="Last login">
                    {formatDateTime(profile.last_login_at)}
                  </DetailRow>
                  <DetailRow label="User ID">
                    <span className="font-mono text-xs">{profile.user_id}</span>
                  </DetailRow>
                </dl>
              </div>
            </Card>

            <Card id="preferences">
              <CardHeader
                title="Market preferences"
                description="The country, language, and currency used for this account."
              />
              <form onSubmit={handleSavePreferences} className="space-y-4 p-5">
                {formError && <Alert type="error">{formError}</Alert>}
                <div className="grid gap-4 sm:grid-cols-3">
                  <Input
                    label="Country code"
                    value={form.country_code}
                    maxLength={2}
                    onChange={(event) =>
                      setDraft({
                        ...form,
                        country_code: event.target.value.replace(/[^a-zA-Z]/g, "").slice(0, 2),
                      })
                    }
                    required
                  />
                  <Input
                    label="Locale"
                    value={form.locale_code}
                    onChange={(event) => setDraft({ ...form, locale_code: event.target.value })}
                    placeholder="en"
                    required
                  />
                  <Input
                    label="Currency"
                    value={form.currency_code}
                    maxLength={3}
                    onChange={(event) =>
                      setDraft({
                        ...form,
                        currency_code: event.target.value
                          .replace(/[^a-zA-Z]/g, "")
                          .slice(0, 3),
                      })
                    }
                    required
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-ink-500">
                    Version {profile.preferences?.version ?? "new"}
                  </p>
                  <Button type="submit" loading={saving}>
                    Save preferences
                  </Button>
                </div>
              </form>
            </Card>

            <Card id="notifications">
              <CardHeader
                title="Notifications"
                description="Marketing consent recorded on your account."
                action={
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-amber-600">
                    <Bell size={16} />
                  </span>
                }
              />
              <div className="flex flex-wrap gap-3 p-5">
                <Badge tone={profile.preferences?.marketing_email ? "emerald" : "slate"}>
                  Email marketing {profile.preferences?.marketing_email ? "on" : "off"}
                </Badge>
                <Badge tone={profile.preferences?.marketing_sms ? "emerald" : "slate"}>
                  SMS marketing {profile.preferences?.marketing_sms ? "on" : "off"}
                </Badge>
              </div>
              <p className="px-5 pb-5 text-xs text-ink-500">
                Consent changes are recorded through the customer consent flow so the
                compliance trail stays intact.
              </p>
            </Card>

            <Card>
              <CardHeader
                title="Sessions"
                description="Devices currently signed in to this account."
                action={
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleRevokeOthers}
                    disabled={sessionBusy}
                  >
                    Sign out other sessions
                  </Button>
                }
              />
              <ul className="divide-y divide-ink-100">
                {sessions.map((session) => (
                  <li
                    key={session.session_id}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink-50 text-ink-500">
                        <Laptop size={17} />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-ink-800">
                          {session.device_name || session.device_id || "Unknown device"}
                          {session.is_current && (
                            <span className="ml-2 align-middle">
                              <Badge tone="emerald">Current</Badge>
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-ink-500">
                          Issued {formatDateTime(session.issued_at)} · last used{" "}
                          {formatDateTime(session.last_used_at)}
                        </p>
                      </div>
                    </div>
                    {!session.is_current && (
                      <button
                        type="button"
                        onClick={() => handleRevoke(session.session_id)}
                        disabled={sessionBusy}
                        className="rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                      >
                        Revoke
                      </button>
                    )}
                  </li>
                ))}
                {sessions.length === 0 && (
                  <li className="px-5 py-6 text-sm text-ink-500">No active sessions found.</li>
                )}
              </ul>
            </Card>
          </div>
        )
      )}
    </div>
  );
}
