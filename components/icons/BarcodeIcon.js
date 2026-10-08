/**
 * @param {{ className?: string }} props
 */
export default function BarcodeIcon({ className = "h-5 w-5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 7v10M7 7v10M9 7v10M12 7v10M15 7v10M18 7v10M20 7v10" />
    </svg>
  );
}
