import BarcodeSearchPage from "@/components/barcode/BarcodeSearchPage";

export const metadata = {
  title: "Barcode search",
  description: "Find a Sukilo product from a barcode photo.",
};

export default function BarcodeSearchRoute() {
  return <BarcodeSearchPage />;
}
