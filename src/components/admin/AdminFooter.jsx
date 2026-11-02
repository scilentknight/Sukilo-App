"use client";

import { useAuth } from "@/context/AuthContext";
import { displayName } from "@/lib/format";

/** Small footer anchored at the bottom-right of the admin workspace. */
export default function AdminFooter() {
  const { user } = useAuth();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-ink-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-col items-start justify-between gap-1 text-xs text-ink-500 sm:flex-row sm:items-center">
        <p>© {year} Sukilo. All rights reserved.</p>
        <p className="flex items-center gap-1.5 sm:text-right">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Signed in as {displayName(user)}
        </p>
      </div>
    </footer>
  );
}
