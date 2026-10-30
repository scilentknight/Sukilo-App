"use client";

/** Skeleton shimmer block for loading states. */
export function Skeleton({ className = "" }) {
  return (
    <div
      className={`skeleton rounded-lg ${className}`}
      aria-hidden="true"
    />
  );
}

/** Full-page centered loading spinner. */
export function LoadingSpinner({ message = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-ink-500">
      <svg
        className="animate-spin h-8 w-8 text-brand-600"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8z"
        />
      </svg>
      <span className="text-sm">{message}</span>
    </div>
  );
}

/** Inline alert for errors and notices. */
export function Alert({ type = "error", children }) {
  const styles = {
    error: "bg-rose-50 border-rose-200 text-rose-800",
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    info: "bg-brand-50 border-brand-200 text-brand-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
  };
  return (
    <div
      role="alert"
      className={`rounded-lg border px-4 py-3 text-sm ${styles[type] ?? styles.info}`}
    >
      {children}
    </div>
  );
}

/** Empty state with optional action. */
export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
      <div className="text-4xl">📦</div>
      <h3 className="font-semibold text-ink-800 text-lg">{title}</h3>
      {description && (
        <p className="text-ink-500 text-sm max-w-sm">{description}</p>
      )}
      {action}
    </div>
  );
}

