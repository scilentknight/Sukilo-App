"use client";

import { useCallback, useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { useCountry } from "@/context/CountryContext";
import { useLocale } from "@/context/LocaleContext";
import {
  confirmClosure,
  createDataExport,
  getDataExport,
  getDataExportDownloadReference,
  getProfile,
  requestClosure,
  requestDataExportVerification,
  requestStepUp,
} from "@/lib/account";
import { formatDate } from "@/lib/format";
import {
  AccountShell,
  AccountSkeleton,
  FormMessage,
  RecentSignInGate,
  Section,
  loginHref,
  signOutLocally,
} from "./AccountShell";
import { useAccountResource } from "./useAccountResource";
import { VerifiedAction } from "./VerifiedAction";

const DATE_TIME = { dateStyle: "medium", timeStyle: "short" };
const STATUS_TONES = { READY: "success", DOWNLOADED: "success", FAILED: "danger", EXPIRED: "warning" };

/** The API has no "list my exports" endpoint, so the latest request id is remembered per account. */
const exportKey = (userId) => `sukilo_data_export:${userId}`;

function readStoredExportId(userId) {
  try {
    return window.localStorage.getItem(exportKey(userId));
  } catch {
    return null;
  }
}

async function loadPrivacy() {
  const profile = await getProfile();
  const exportId = readStoredExportId(profile.user_id);
  let latestExport = null;
  if (exportId) {
    try {
      latestExport = await getDataExport(exportId);
    } catch (error) {
      if (error.status !== 404) throw error;
    }
  }
  return { userId: profile.user_id, latestExport };
}

/** Data export (`/me/data-export*`) and account closure (`/me/closure*`). */
export function PrivacyPanel() {
  const resource = useAccountResource(loadPrivacy);
  const [exitHref, setExitHref] = useState(null);

  const signOutTo = async (href) => {
    setExitHref(href);
    await signOutLocally();
  };

  return (
    <AccountShell title="Privacy" exitHref={exitHref}>
      {resource.state === "loading" ? <AccountSkeleton /> : null}
      {resource.state === "error" ? (
        <ErrorState title="Unable to load your privacy settings" message={resource.error} onRetry={resource.reload} />
      ) : null}
      {resource.state === "ready" ? (
        <>
          <DataExport
            userId={resource.data.userId}
            latestExport={resource.data.latestExport}
            onExport={(latestExport) => resource.setData((prev) => ({ ...prev, latestExport }))}
          />
          <AccountClosure
            onClosed={() => signOutTo("/login?notice=closed")}
            onSignInAgain={() => signOutTo(loginHref("/account/privacy"))}
          />
        </>
      ) : null}
    </AccountShell>
  );
}

function DataExport({ userId, latestExport, onExport }) {
  const { countryCode } = useCountry();
  const { language } = useLocale();
  const [requesting, setRequesting] = useState(false);
  const [busy, setBusy] = useState(null);
  const [message, setMessage] = useState({ error: null, success: null });
  const [reference, setReference] = useState(null);
  const idempotencyKey = useRef(null);

  const onGrant = async (grant) => {
    idempotencyKey.current ??= crypto.randomUUID();
    const created = await createDataExport({ countryCode, grant, idempotencyKey: idempotencyKey.current });
    idempotencyKey.current = null;
    try {
      window.localStorage.setItem(exportKey(userId), created.export_request_id);
    } catch {
      // Without storage the status is only shown until the page is left.
    }
    onExport(await getDataExport(created.export_request_id));
    setRequesting(false);
    setMessage({ error: null, success: "Export requested. It is prepared in the background." });
  };

  const run = async (key, action) => {
    if (busy) return;
    setBusy(key);
    setMessage({ error: null, success: null });
    try {
      await action();
    } catch (error) {
      setMessage({ error: error.message, success: null });
    } finally {
      setBusy(null);
    }
  };

  const refresh = () => run("refresh", async () => onExport(await getDataExport(latestExport.export_request_id)));
  const download = () =>
    run("download", async () => {
      setReference(await getDataExportDownloadReference(latestExport.export_request_id));
      onExport(await getDataExport(latestExport.export_request_id));
    });

  return (
    <Section
      title="Download your data"
      description="Request a copy of your account data for the current market. We confirm your password and email you a code first."
    >
      <div className="mt-3 space-y-3">
        <FormMessage {...message} />
        {latestExport ? (
          <div className="rounded-lg border border-ink-100 bg-ink-50/60 p-4 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-ink-800">Latest request</span>
              <Badge tone={STATUS_TONES[latestExport.status] ?? "info"}>{latestExport.status.toLowerCase()}</Badge>
            </div>
            <p className="mt-1 text-ink-500">
              Requested {formatDate(latestExport.requested_at, language, DATE_TIME)}
              {latestExport.completed_at ? ` · Ready ${formatDate(latestExport.completed_at, language, DATE_TIME)}` : ""}
              {latestExport.downloaded_at ? ` · Downloaded ${formatDate(latestExport.downloaded_at, language, DATE_TIME)}` : ""}
            </p>
            {latestExport.status === "PENDING" || latestExport.status === "PROCESSING" ? (
              <p className="mt-1 text-ink-500">Your export is being prepared. Check back later.</p>
            ) : null}
            {reference ? (
              <p className="mt-2 break-all text-ink-700">
                Download reference: <code className="text-xs">{reference}</code>
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="outline" onClick={refresh} isLoading={busy === "refresh"} disabled={Boolean(busy)}>
                Refresh status
              </Button>
              {latestExport.status === "READY" ? (
                <Button type="button" size="sm" onClick={download} isLoading={busy === "download"} disabled={Boolean(busy)}>
                  Get download
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
        {requesting ? (
          <VerifiedAction
            requestCode={(password) => requestDataExportVerification({ password, localeCode: language })}
            purpose="DATA_EXPORT"
            onGrant={onGrant}
            startLabel="Send code"
            confirmLabel="Request export"
            onCancel={() => setRequesting(false)}
          />
        ) : (
          <Button type="button" variant="outline" onClick={() => setRequesting(true)}>
            Request data export
          </Button>
        )}
      </div>
    </Section>
  );
}

function AccountClosure({ onClosed, onSignInAgain }) {
  const { language } = useLocale();
  const [phase, setPhase] = useState("idle");
  const [preview, setPreview] = useState(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState(null);

  const requestCode = useCallback(
    (password) => requestStepUp({ password, actionClass: "ACCOUNT_CLOSURE", localeCode: language }),
    [language],
  );

  const onGrant = async (stepUpGrant, password) => {
    try {
      setPreview(await requestClosure({ password, stepUpGrant }));
    } catch (err) {
      if (err.status !== 400) throw err;
      throw new Error("We couldn't confirm this request. Sign in again, then close your account within 15 minutes.");
    }
    setPhase("preview");
  };

  const onConfirm = async () => {
    if (phase === "closing") return;
    setPhase("closing");
    setError(null);
    try {
      await confirmClosure(preview.close_grant);
    } catch (err) {
      setError(err.message);
      setPhase("preview");
      return;
    }
    await onClosed();
  };

  const reset = () => {
    setPhase("idle");
    setPreview(null);
    setAcknowledged(false);
    setError(null);
  };

  return (
    <Section
      title="Close account"
      description="Closing signs you out everywhere and removes your contact details. Some records may be kept where the law requires."
      className="border-rose-200"
    >
      {phase === "idle" ? (
        <Button type="button" variant="outline" className="mt-3" onClick={() => setPhase("verify")}>
          Close my account
        </Button>
      ) : null}
      {phase === "verify" ? (
        <RecentSignInGate maxAgeMinutes={15} action="closing your account" onSignInAgain={onSignInAgain}>
          <VerifiedAction
            requestCode={requestCode}
            purpose="STEP_UP"
            actionClass="ACCOUNT_CLOSURE"
            onGrant={onGrant}
            startLabel="Send code"
            confirmLabel="Review closure"
            onCancel={reset}
          />
        </RecentSignInGate>
      ) : null}
      {preview && (phase === "preview" || phase === "closing") ? (
        <div className="mt-3 space-y-3 text-sm">
          <div>
            <p className="font-medium text-ink-800">What happens</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-ink-600">
              {preview.effects.map((effect) => (
                <li key={effect}>{effect}</li>
              ))}
            </ul>
          </div>
          {preview.retention_notices.length > 0 ? (
            <div>
              <p className="font-medium text-ink-800">What we keep</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-ink-600">
                {[...new Set(preview.retention_notices.map((notice) => notice.notice))].map((notice) => (
                  <li key={notice}>{notice}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <label className="flex items-center gap-2 text-ink-700">
            <input type="checkbox" checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} />
            I understand this cannot be undone.
          </label>
          <FormMessage error={error} />
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="danger" onClick={onConfirm} isLoading={phase === "closing"} disabled={!acknowledged}>
              Permanently close account
            </Button>
            <Button type="button" variant="ghost" onClick={reset} disabled={phase === "closing"}>
              Keep my account
            </Button>
          </div>
        </div>
      ) : null}
    </Section>
  );
}
