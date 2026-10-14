import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata = {
  title: "Stores & vendors",
  description: "A directory of Sukilo sellers is coming soon.",
};

/** The API has no vendor/store model yet, so there is no directory to list. */
export default function VendorsPage() {
  return (
    <ComingSoon
      title="Store directory coming soon"
      description="Seller storefronts aren't available yet. Sellers can already list products from the vendor dashboard."
    />
  );
}
