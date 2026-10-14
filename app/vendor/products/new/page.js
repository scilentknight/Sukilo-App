import Link from "next/link";
import VendorHeader from "@/components/vendor/VendorHeader";
import VendorProductForm from "@/components/vendor/VendorProductForm";

export const metadata = {
  title: "Add a product",
};

export default function NewVendorProductPage() {
  return (
    <>
      <VendorHeader />
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <Link href="/vendor" className="text-sm font-bold text-[#e24b6a] hover:underline">
          ← Vendor home
        </Link>
        <div className="mt-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:p-8">
          <div className="mb-7 border-b border-gray-100 pb-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#e24b6a]">
              Catalog
            </p>
            <h1 className="mt-1 text-3xl font-extrabold text-[#2b2422]">
              Add a product
            </h1>
            <p className="mt-2 text-sm leading-6 text-stone-500">
              Product images are stored and indexed automatically for customer visual search.
            </p>
          </div>
          <VendorProductForm />
        </div>
      </div>
    </>
  );
}
