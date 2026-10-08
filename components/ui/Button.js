/**
 * @param {import("react").ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "outline" }} props
 */
export default function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold uppercase tracking-wide transition disabled:cursor-not-allowed disabled:opacity-50";
  const styles =
    variant === "primary"
      ? "bg-[#ff3f6c] text-white shadow-md shadow-[#ff3f6c]/25 hover:bg-[#e5365f]"
      : variant === "outline"
        ? "border border-gray-200 bg-white text-gray-800 hover:border-[#ff3f6c]/40 hover:bg-[#fff5f7]"
        : "border border-gray-200 bg-gray-50 text-gray-800 hover:bg-gray-100";
  return (
    <button type="button" className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
}
