import { AddressBook } from "@/components/account/AddressBook";

export const metadata = {
  title: "Addresses",
  description: "Manage your saved shipping and billing addresses.",
  robots: { index: false, follow: false },
};

export default function AddressesPage() {
  return <AddressBook />;
}
