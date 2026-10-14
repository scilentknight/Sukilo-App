import { Suspense } from "react";
import { AdminLogin } from "@/components/admin/AdminLogin";

export const metadata = { title: { absolute: "Sign in | Sukilo Admin" } };

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLogin />
    </Suspense>
  );
}
