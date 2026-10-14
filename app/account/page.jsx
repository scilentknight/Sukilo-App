import { AccountOverview } from "@/components/account/AccountOverview";

export const metadata = {
  title: "Your account",
  description: "Manage your Sukilo account and signed-in devices.",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return <AccountOverview />;
}
