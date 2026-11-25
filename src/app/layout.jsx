import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: {
    default: "Sukilo — Online Shopping Platform",
    template: "%s | Sukilo",
  },
  description:
    "Sukilo is your one-stop shop for quality electronics, fashion, home goods, and more.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
