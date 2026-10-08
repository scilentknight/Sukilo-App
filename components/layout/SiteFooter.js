import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-16 bg-[#2b2422] text-rose-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:flex-row sm:items-end sm:justify-between sm:px-6 lg:px-8">
        <div>
          <p className="text-3xl font-extrabold text-white">Sukilo</p>
          <p className="mt-3 max-w-sm text-sm leading-7 text-rose-100/80">
            A small fashion shop you can browse by eye. If you see it, you can search for it.
          </p>
        </div>
        <div className="flex gap-6 text-sm font-semibold">
          <Link href="/" className="hover:text-white">
            Shop
          </Link>
          <Link href="/visual-search" className="hover:text-white">
            Photo search
          </Link>
          <Link href="/barcode-search" className="hover:text-white">
            Barcode search
          </Link>
          <Link href="/vendor" className="hover:text-white">
            Sell on Sukilo
          </Link>
          <Link href="/status" className="hover:text-white">
            Status
          </Link>
        </div>
      </div>
    </footer>
  );
}
