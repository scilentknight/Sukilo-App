import VendorDashboard from "@/components/vendor/VendorDashboard";
import VendorHeader from "@/components/vendor/VendorHeader";

export const metadata = {
  title: "Vendor workspace",
};

export default function VendorPage() {
  return (
    <>
      <VendorHeader />
      <VendorDashboard />
    </>
  );
}
