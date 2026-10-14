"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import {
  GRANT_ACTION,
  REVOKE_ACTION,
  grantAssignment,
  listAssignments,
  listPermissions,
  listRoles,
  revokeAssignment,
} from "@/lib/access";
import { requestStepUp } from "@/lib/account";
import { formatDate } from "@/lib/format";
import { AccountSkeleton, FormMessage, Section } from "@/components/account/AccountShell";
import { useAccountResource } from "@/components/account/useAccountResource";
import { VerifiedAction } from "@/components/account/VerifiedAction";

const PAGE_SIZE = 25;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SELECT = "h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm";

async function loadCatalog() {
  const [roles, permissions] = await Promise.all([listRoles(), listPermissions()]);
  return { roles, permissions };
}

/**
 * Role assignment console for `/api/v1/access/*`. Every read and write is
 * authorized by the API (403 otherwise); mutations also need a fresh step-up.
 */
export function AccessAdmin() {
  const { status } = useAuth();
  const catalog = useAccountResource(loadCatalog);
  const [lookup, setLookup] = useState(null);

  let body = <AccountSkeleton />;
  if (status === "authenticated" && catalog.state === "error") {
    const denied = catalog.errorStatus === 403;
    body = (
      <ErrorState
        title={denied ? "You don't have access to this page" : "Unable to load access controls"}
        message={denied ? "Ask an administrator to grant you an IAM role." : catalog.error}
        onRetry={denied ? undefined : catalog.reload}
      />
    );
  } else if (status === "authenticated" && catalog.state === "ready") {
    body = (
      <>
        <AssignmentLookup onLookup={setLookup} />
        {lookup ? <AssignmentList key={JSON.stringify(lookup)} filter={lookup} /> : null}
        <GrantForm roles={catalog.data.roles} onGranted={(filter) => setLookup({ ...filter })} />
        <Catalog roles={catalog.data.roles} permissions={catalog.data.permissions} />
      </>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900 dark:text-white">Access control</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">Grant and revoke staff roles. Changes require your password and an emailed code.</p>
      </div>
      {body}
    </div>
  );
}

function AssignmentLookup({ onLookup }) {
  const [values, setValues] = useState({ userId: "", countryId: "" });
  const [error, setError] = useState(null);

  const submit = (event) => {
    event.preventDefault();
    const userId = values.userId.trim();
    const countryId = values.countryId.trim();
    if (!userId && !countryId) return setError("Enter a user ID, a country ID, or both.");
    if ((userId && !UUID.test(userId)) || (countryId && !UUID.test(countryId))) return setError("IDs must be UUIDs.");
    setError(null);
    onLookup({ userId: userId || undefined, countryId: countryId || undefined });
  };

  return (
    <Section title="Find assignments" description="The API requires a user or country filter.">
      <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end" noValidate>
        <Input label="User ID" value={values.userId} onChange={(e) => setValues((v) => ({ ...v, userId: e.target.value }))} />
        <Input label="Country ID" value={values.countryId} onChange={(e) => setValues((v) => ({ ...v, countryId: e.target.value }))} />
        <Button type="submit">Search</Button>
      </form>
      <div className="mt-2">
        <FormMessage error={error} />
      </div>
    </Section>
  );
}

function AssignmentList({ filter }) {
  const { language } = useLocale();
  const [page, setPage] = useState({ items: [], cursor: null, state: "loading", error: null });
  const [revoking, setRevoking] = useState(null);
  const [notice, setNotice] = useState(null);

  const fetchPage = useCallback(
    async (cursor) => {
      const items = await listAssignments({ ...filter, limit: PAGE_SIZE, cursor });
      return { items, cursor: items.length === PAGE_SIZE ? items[items.length - 1].assignment_id : null };
    },
    [filter],
  );

  useEffect(() => {
    let cancelled = false;
    fetchPage(null)
      .then((result) => !cancelled && setPage({ ...result, state: "ready", error: null }))
      .catch((error) => !cancelled && setPage({ items: [], cursor: null, state: "error", error: error.message }));
    return () => {
      cancelled = true;
    };
  }, [fetchPage]);

  const loadMore = async () => {
    setPage((prev) => ({ ...prev, state: "more" }));
    try {
      const next = await fetchPage(page.cursor);
      setPage((prev) => ({ items: [...prev.items, ...next.items], cursor: next.cursor, state: "ready", error: null }));
    } catch (error) {
      setPage((prev) => ({ ...prev, state: "ready", error: error.message }));
    }
  };

  const onRevoked = (updated) => {
    setPage((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.assignment_id === updated.assignment_id ? updated : item)),
    }));
    setRevoking(null);
    setNotice(`Revoked ${updated.role_code}.`);
  };

  return (
    <Section title="Assignments">
      <div className="mt-2 space-y-2">
        <FormMessage error={page.state === "error" ? null : page.error} success={notice} />
      </div>
      {page.state === "loading" ? <AccountSkeleton /> : null}
      {page.state === "error" ? <ErrorState title="Unable to load assignments" message={page.error} /> : null}
      {page.state !== "loading" && page.state !== "error" && page.items.length === 0 ? (
        <EmptyState className="mt-3" title="No assignments found" message="Nothing matches this filter within your scope." />
      ) : null}
      {page.items.length > 0 ? (
        <ul className="mt-3 divide-y divide-ink-100">
          {page.items.map((item) => (
            <li key={item.assignment_id} className="py-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-ink-900">{item.role_code}</span>
                <Badge>{item.scope_type.toLowerCase()}</Badge>
                {item.revoked_at ? (
                  <Badge tone="danger">revoked {formatDate(item.revoked_at, language)}</Badge>
                ) : (
                  <Badge tone="success">active</Badge>
                )}
              </div>
              <p className="mt-1 break-all text-xs text-ink-500">
                User {item.user_id}
                {item.country_id ? ` · Country ${item.country_id}` : ""}
                {item.valid_to ? ` · Until ${formatDate(item.valid_to, language)}` : ""}
              </p>
              {!item.revoked_at && revoking !== item.assignment_id ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={() => {
                    setNotice(null);
                    setRevoking(item.assignment_id);
                  }}
                  disabled={Boolean(revoking)}
                >
                  Revoke
                </Button>
              ) : null}
              {revoking === item.assignment_id ? (
                <RevokeForm assignment={item} onRevoked={onRevoked} onCancel={() => setRevoking(null)} />
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
      {page.cursor ? (
        <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={loadMore} isLoading={page.state === "more"}>
          Load more
        </Button>
      ) : null}
    </Section>
  );
}

function RevokeForm({ assignment, onRevoked, onCancel }) {
  const { language } = useLocale();
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  if (!confirmed) {
    return (
      <form
        className="mt-3 flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          const trimmed = reason.trim();
          if (!trimmed || trimmed.length > 255) return setReasonError("Give a reason (up to 255 characters).");
          setReasonError(null);
          setConfirmed(true);
        }}
        noValidate
      >
        <Input label="Reason" value={reason} error={reasonError} onChange={(e) => setReason(e.target.value)} />
        <div className="flex gap-2">
          <Button type="submit" size="sm">
            Continue
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  return (
    <VerifiedAction
      requestCode={(password) => requestStepUp({ password, actionClass: REVOKE_ACTION, localeCode: language })}
      purpose="STEP_UP"
      actionClass={REVOKE_ACTION}
      startLabel="Send code"
      confirmLabel="Revoke role"
      onGrant={async (grant) =>
        onRevoked(
          await revokeAssignment(
            { assignmentId: assignment.assignment_id, countryId: assignment.country_id, reason: reason.trim() },
            grant,
          ),
        )
      }
      onCancel={onCancel}
    />
  );
}

function GrantForm({ roles, onGranted }) {
  const { language } = useLocale();
  const [values, setValues] = useState({ userId: "", roleCode: roles[0]?.code ?? "", countryId: "", validTo: "" });
  const [ready, setReady] = useState(null);
  const [message, setMessage] = useState({ error: null, success: null });
  const role = roles.find((r) => r.code === values.roleCode);
  const needsCountry = role?.scope_type === "COUNTRY";

  const review = (event) => {
    event.preventDefault();
    setMessage({ error: null, success: null });
    const userId = values.userId.trim();
    const countryId = values.countryId.trim();
    if (!UUID.test(userId)) return setMessage({ error: "Enter the user's ID (UUID).", success: null });
    if (!role) return setMessage({ error: "Choose a role.", success: null });
    if (role.scope_type !== "GLOBAL" && role.scope_type !== "COUNTRY") {
      return setMessage({ error: `${role.scope_type} scoped roles can't be granted here yet.`, success: null });
    }
    if (needsCountry && !UUID.test(countryId)) return setMessage({ error: "Enter the country ID (UUID).", success: null });
    setReady({
      user_id: userId,
      role_code: role.code,
      scope_type: role.scope_type,
      scope_id: needsCountry ? countryId : null,
      country_id: needsCountry ? countryId : null,
      valid_to: values.validTo ? new Date(values.validTo).toISOString() : null,
    });
  };

  const onGrant = async (grant) => {
    const created = await grantAssignment(ready, grant);
    setReady(null);
    setMessage({ error: null, success: `Granted ${created.role_code}.` });
    onGranted({ userId: created.user_id });
  };

  return (
    <Section title="Grant a role">
      {ready ? (
        <>
          <p className="mt-2 text-sm text-ink-600">
            Granting <strong>{ready.role_code}</strong> to {ready.user_id}
            {ready.country_id ? ` in country ${ready.country_id}` : " globally"}.
          </p>
          <VerifiedAction
            requestCode={(password) => requestStepUp({ password, actionClass: GRANT_ACTION, localeCode: language })}
            purpose="STEP_UP"
            actionClass={GRANT_ACTION}
            startLabel="Send code"
            confirmLabel="Grant role"
            onGrant={onGrant}
            onCancel={() => setReady(null)}
          />
        </>
      ) : (
        <form onSubmit={review} className="mt-4 grid gap-4 sm:grid-cols-2" noValidate>
          <Input label="User ID" value={values.userId} onChange={(e) => setValues((v) => ({ ...v, userId: e.target.value }))} />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="grant-role" className="text-sm font-medium leading-5 text-gray-700">
              Role
            </label>
            <select
              id="grant-role"
              className={SELECT}
              value={values.roleCode}
              onChange={(e) => setValues((v) => ({ ...v, roleCode: e.target.value }))}
            >
              {roles.map((r) => (
                <option key={r.role_id} value={r.code}>
                  {r.name} ({r.scope_type.toLowerCase()})
                </option>
              ))}
            </select>
          </div>
          {needsCountry ? (
            <Input label="Country ID" value={values.countryId} onChange={(e) => setValues((v) => ({ ...v, countryId: e.target.value }))} />
          ) : null}
          <Input
            label="Expires (optional)"
            type="datetime-local"
            value={values.validTo}
            onChange={(e) => setValues((v) => ({ ...v, validTo: e.target.value }))}
          />
          <div className="space-y-3 sm:col-span-2">
            <FormMessage {...message} />
            <Button type="submit">Review grant</Button>
          </div>
        </form>
      )}
    </Section>
  );
}

function Catalog({ roles, permissions }) {
  return (
    <Section title="Roles and permissions" description="Read-only catalog from the API.">
      <div className="mt-3 grid gap-6 sm:grid-cols-2">
        <ul className="space-y-1 text-sm">
          {roles.map((role) => (
            <li key={role.role_id} className="text-ink-700">
              <span className="font-medium">{role.code}</span> · {role.scope_type.toLowerCase()}
            </li>
          ))}
        </ul>
        <ul className="space-y-1 text-xs text-ink-600">
          {permissions.map((permission) => (
            <li key={permission.permission_id}>
              <code>{permission.code}</code> — {permission.description}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
