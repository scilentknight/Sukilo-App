export const metadata = {
  title: { default: "Admin", template: "%s | Sukilo Admin" },
  robots: { index: false, follow: false },
};

/** Shared admin metadata. The signed-in frame lives in `(panel)` so `/admin/login` stays outside it. */
export default function AdminLayout({ children }) {
  return children;
}
