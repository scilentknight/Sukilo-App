import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/format";

const DATE_TIME = { dateStyle: "medium", timeStyle: "short" };

/** Active sessions from `GET /api/v1/auth/sessions`; other devices can be signed out. */
export function SessionList({ sessions, busyId, onRevoke, language }) {
  if (sessions.length === 0) {
    return <p className="mt-3 text-sm text-ink-500">No active sessions.</p>;
  }

  return (
    <ul className="mt-3 divide-y divide-ink-100">
      {sessions.map((session) => (
        <li key={session.session_id} className="flex flex-wrap items-center gap-3 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink-800">
              {session.device_name || "Unknown device"}
              {session.is_current ? (
                <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                  This device
                </span>
              ) : null}
            </p>
            <p className="text-xs text-ink-400">
              Signed in {formatDate(session.issued_at, language, DATE_TIME)}
              {session.last_used_at
                ? ` · Last active ${formatDate(session.last_used_at, language, DATE_TIME)}`
                : ""}
            </p>
          </div>
          {session.is_current ? null : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onRevoke(session.session_id)}
              isLoading={busyId === session.session_id}
              disabled={Boolean(busyId)}
            >
              Sign out
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}
