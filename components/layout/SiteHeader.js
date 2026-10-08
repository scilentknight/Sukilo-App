import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ff3f6c] text-sm font-extrabold text-white"
          >
            S
          </span>
          <span className="text-xl font-extrabold tracking-tight text-gray-900">
            Sukilo
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-gray-600 sm:flex">
          <span className="text-[#ff3f6c]">Visual Search</span>
          <Link href="/status" className="hover:text-gray-900 transition-colors">
            System Status
          </Link>
        </nav>
        <p className="text-xs font-medium text-gray-500 sm:text-sm">
          Fashion & lifestyle catalog
        </p>
      </div>
    </header>
  );
}
