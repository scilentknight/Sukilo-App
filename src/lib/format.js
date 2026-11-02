/** Formatting helpers shared by the admin panel. */

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

export function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateTimeFormatter.format(date);
}

export function formatMoney(value, currency) {
  const amount = Number(value);
  const text = Number.isFinite(amount)
    ? amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "—";
  return currency ? `${currency} ${text}` : text;
}

/** Build one or two initials from a person name, an email, or a masked email. */
export function initials(value) {
  const source = String(value || "").trim();
  if (!source) return "?";
  const local = source.includes("@") ? source.split("@")[0] : source;
  const words = local.replace(/[^a-zA-Z0-9]+/g, " ").trim().split(/\s+/);
  if (!words[0]) return source[0].toUpperCase();
  if (words.length > 1) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return words[0].slice(0, 2).toUpperCase();
}

export function displayName(user) {
  if (!user) return "Administrator";
  if (user.display_name) return user.display_name;
  if (user.full_name) return user.full_name;
  if (user.name) return user.name;
  if (user.email_masked) return user.email_masked.split("@")[0];
  return "Administrator";
}

export function humanize(value) {
  if (!value) return "—";
  return String(value)
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const TONES = {
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
  rose: "bg-rose-50 text-rose-700 ring-rose-600/20",
  slate: "bg-ink-100 text-ink-600 ring-ink-500/20",
  sky: "bg-sky-50 text-sky-700 ring-sky-600/20",
  indigo: "bg-brand-50 text-brand-700 ring-brand-600/20",
};

export function badgeClasses(tone = "slate") {
  return TONES[tone] || TONES.slate;
}

/** Map one backend status value onto a badge colour tone. */
export function statusTone(status) {
  switch (String(status || "").toUpperCase()) {
    case "ACTIVE":
    case "APPROVED":
    case "VERIFIED":
    case "PUBLISHED":
      return "emerald";
    case "PENDING":
    case "SUBMITTED":
    case "REVIEW":
    case "DRAFT":
      return "amber";
    case "REJECTED":
    case "SUSPENDED":
    case "CLOSED":
    case "RETIRED":
      return "rose";
    default:
      return "slate";
  }
}
