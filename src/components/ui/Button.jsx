"use client";

/** Reusable button with size and variant props. */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  loading,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 focus-ring disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800",
    secondary:
      "bg-white text-ink-800 border border-ink-200 hover:bg-ink-50 active:bg-ink-100",
    danger:
      "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800",
    ghost:
      "text-brand-600 hover:bg-brand-50 active:bg-brand-100",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2",
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
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
      )}
      {children}
    </button>
  );
}

