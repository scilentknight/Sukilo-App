import { PrivacyPanel } from "@/components/account/PrivacyPanel";

export const metadata = {
  title: "Privacy",
  description: "Download your data or close your Sukilo account.",
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return <PrivacyPanel />;
}
