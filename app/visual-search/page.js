import Link from "next/link";
import ImageSearch from "@/components/search/ImageSearch";
import SiteFooter from "@/components/layout/SiteFooter";

export default function VisualSearchPage() {
  return (
    <>
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="text-sm font-bold text-[#ff3f6c] hover:underline">
            ← Sukilo Shop
          </Link>
          <p className="text-sm font-semibold text-gray-600">Visual search</p>
        </div>
      </div>
      <ImageSearch />
      <SiteFooter />
    </>
  );
}
