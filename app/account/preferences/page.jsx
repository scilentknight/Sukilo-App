import { PreferencesPanel } from "@/components/account/PreferencesPanel";

export const metadata = {
  title: "Preferences",
  description: "Choose your shopping market and manage consents.",
  robots: { index: false, follow: false },
};

export default function PreferencesPage() {
  return <PreferencesPanel />;
}
