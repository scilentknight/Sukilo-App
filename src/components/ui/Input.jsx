"use client";

/** Reusable text/email/password input. */
export default function Input({
  label,
  error,
  className = "",
  id,
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-ink-700"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-lg border px-3 py-2 text-sm text-ink-900
          placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500
          transition-colors
          ${error ? "border-rose-400 bg-rose-50" : "border-ink-200 bg-white hover:border-ink-300"}
        `}
        {...props}
      />
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}

