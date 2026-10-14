import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata = {
  title: "Contact us",
  description: "Get in touch with the Sukilo team.",
};

export default function ContactPage() {
  return (
    <ComingSoon
      title="Contact us"
      description="Our contact form isn't connected yet. The backend currently exposes no messaging endpoint."
    />
  );
}
