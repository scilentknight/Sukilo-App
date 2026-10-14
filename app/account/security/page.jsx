import { SecurityPanel } from "@/components/account/SecurityPanel";

export const metadata = {
  title: "Security",
  description: "Change the email or phone number you sign in with.",
  robots: { index: false, follow: false },
};

export default function SecurityPage() {
  return <SecurityPanel />;
}
