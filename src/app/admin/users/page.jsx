"use client";

/** Placeholder users page — no dedicated list-all-users endpoint exists in the backend. */
export default function AdminUsersPage() {
  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-6">Users</h2>
      <div className="bg-ink-800 border border-ink-700 rounded-xl p-8 text-center">
        <div className="text-4xl mb-3">🚧</div>
        <h3 className="text-base font-semibold text-white mb-2">
          User management coming soon
        </h3>
        <p className="text-sm text-ink-400 max-w-sm mx-auto">
          The backend does not currently expose a list-all-users endpoint.
          Existing accounts can be managed directly in the database.
        </p>
      </div>
    </div>
  );
}

