import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
      <div className="text-7xl font-black text-ink-200">404</div>
      <h1 className="text-2xl font-bold text-ink-800">Page not found</h1>
      <p className="text-ink-500 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-4 px-6 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}

