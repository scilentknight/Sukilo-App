import { notFound, redirect } from "next/navigation";
import { ApiError } from "@/lib/api";
import { getProductByGtin } from "@/lib/products";

/** GS1 Digital Link entry point (`/01/{gtin}`) printed in product QR codes. */
export default async function DigitalLinkPage({ params }) {
  const { gtin } = await params;

  let product;
  try {
    product = await getProductByGtin(gtin, { cache: "no-store" });
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 422)) notFound();
    throw error;
  }
  redirect(`/product/${product.id}`);
}
