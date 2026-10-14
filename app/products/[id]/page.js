import { permanentRedirect } from "next/navigation";

/** Legacy product URL; `/product/[id]` is the canonical detail page. */
export default async function LegacyProductPage({ params }) {
  const { id } = await params;
  permanentRedirect(`/product/${encodeURIComponent(id)}`);
}
