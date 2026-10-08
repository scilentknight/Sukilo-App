import Link from "next/link";

export default function VendorHeader() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/vendor" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e24b6a] font-extrabold text-white">
            S
          </span>
          <span>
            <span className="block text-lg font-extrabold leading-none text-[#2b2422]">
              Sukilo Vendor
            </span>
            <span className="mt-1 block text-xs text-stone-500">Catalog workspace</span>
          </span>
        </Link>
        <Link
          href="/"
          className="rounded-full border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:border-rose-200 hover:text-[#e24b6a]"
        >
          View shop
        </Link>
      </div>
    </header>
  );
}
