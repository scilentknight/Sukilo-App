import { permanentRedirect } from "next/navigation";
import { categoryHref } from "@/lib/search-params";

/** Legacy category URL; the product listing is the canonical category page. */
export default async function CategoryPage({ params }) {
  const { name } = await params;
  permanentRedirect(categoryHref(decodeURIComponent(name)));
}
