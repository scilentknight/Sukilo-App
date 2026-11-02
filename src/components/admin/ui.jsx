"use client";

import Link from "next/link";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Search,
} from "lucide-react";
import { badgeClasses, humanize, initials, statusTone } from "@/lib/format";

/** Section title with optional right-aligned actions. */
export function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-xl font-semibold text-ink-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/** White surface used for every panel on an admin page. */
export function Card({ children, className = "", id }) {
  return (
    <section
      id={id}
      className={`rounded-xl border border-ink-200 bg-white shadow-sm ${className}`}
    >
      {children}
    </section>
  );
}

export function CardHeader({ title, description, action }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-ink-100 px-5 py-4">
      <div>
        <h3 className="text-sm font-semibold text-ink-800">{title}</h3>
        {description && <p className="mt-0.5 text-xs text-ink-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

const STAT_TONES = {
  indigo: "bg-brand-50 text-brand-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  sky: "bg-sky-50 text-sky-600",
  rose: "bg-rose-50 text-rose-600",
};

/** Compact headline metric with an icon. */
export function StatCard({ label, value, hint, icon: Icon, tone = "indigo" }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-ink-900">{value}</p>
          {hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
        </div>
        {Icon && (
          <span className={`grid h-10 w-10 place-items-center rounded-lg ${STAT_TONES[tone]}`}>
            <Icon size={19} />
          </span>
        )}
      </div>
    </Card>
  );
}

export function Badge({ children, tone = "slate" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${badgeClasses(
        tone,
      )}`}
    >
      {children}
    </span>
  );
}

/** Badge that picks a colour from the backend status value. */
export function StatusBadge({ value }) {
  return <Badge tone={statusTone(value)}>{humanize(value)}</Badge>;
}

/** Small chips for the countries a record is enabled in. */
export function CountryChips({ codes }) {
  if (!codes?.length) return <span className="text-ink-400">—</span>;
  return (
    <span className="flex flex-wrap gap-1">
      {codes.map((code) => (
        <span
          key={code}
          className="rounded bg-ink-100 px-1.5 py-0.5 text-[11px] font-semibold text-ink-600"
        >
          {code}
        </span>
      ))}
    </span>
  );
}

export function Avatar({ name, size = "md" }) {
  const sizes = {
    sm: "h-7 w-7 text-[10px]",
    md: "h-9 w-9 text-xs",
    lg: "h-12 w-12 text-sm",
  };
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full bg-brand-50 font-semibold text-brand-700 ${sizes[size]}`}
    >
      {initials(name)}
    </span>
  );
}

export function EmptyState({ title, description, action, icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-ink-50 text-ink-400">
        <Icon size={22} />
      </span>
      <div>
        <h3 className="text-sm font-semibold text-ink-800">{title}</h3>
        {description && <p className="mt-1 max-w-sm text-sm text-ink-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function ErrorNote({ message, onRetry }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between">
      <span className="flex items-center gap-2">
        <AlertCircle size={16} />
        {message}
      </span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="self-start rounded-md border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function SearchField({
  value,
  onChange,
  onSubmit,
  placeholder = "Search…",
  className = "",
}) {
  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
      className={`relative ${className}`}
    >
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-lg border border-ink-200 bg-white pl-9 pr-3 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
    </form>
  );
}

export function SelectField({ label, value, onChange, options, className = "" }) {
  return (
    <label className={`flex items-center gap-2 text-sm ${className}`}>
      {label && <span className="whitespace-nowrap text-ink-500">{label}</span>}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 rounded-lg border border-ink-200 bg-white px-2.5 text-sm text-ink-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Shared style for link-styled primary actions. */
export const primaryLinkClass =
  "inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 text-sm font-semibold text-white hover:bg-brand-700 focus-ring";

export function LinkButton({ href, children, variant = "primary" }) {
  const variants = {
    primary: primaryLinkClass,
    secondary:
      "inline-flex h-9 items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3.5 text-sm font-semibold text-ink-700 hover:bg-ink-50 focus-ring",
  };
  return (
    <Link href={href} className={variants[variant]}>
      {children}
    </Link>
  );
}

export function Pagination({ total, limit, offset, onChange }) {
  const page = Math.floor(offset / limit) + 1;
  const pages = Math.max(1, Math.ceil(total / limit));
  const first = total === 0 ? 0 : offset + 1;
  const last = Math.min(offset + limit, total);

  return (
    <div className="flex flex-col items-start justify-between gap-2 border-t border-ink-100 px-4 py-3 text-xs text-ink-500 sm:flex-row sm:items-center">
      <p>
        Showing {first}–{last} of {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, offset - limit))}
          disabled={offset === 0}
          aria-label="Previous page"
          className="grid h-8 w-8 place-items-center rounded-lg border border-ink-200 bg-white text-ink-600 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>
        <span>
          Page {page} of {pages}
        </span>
        <button
          type="button"
          onClick={() => onChange(offset + limit)}
          disabled={offset + limit >= total}
          aria-label="Next page"
          className="grid h-8 w-8 place-items-center rounded-lg border border-ink-200 bg-white text-ink-600 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export function DetailRow({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-ink-100 py-2.5 last:border-0">
      <dt className="text-xs font-medium text-ink-500">{label}</dt>
      <dd className="text-right text-sm text-ink-800">{children ?? "—"}</dd>
    </div>
  );
}
