import type { Metadata } from "next";
import Sidebar from "@/components/admin/Sidebar";
import { apiServerSafe } from "@/lib/apiServer";
import type { ApiUser } from "@/lib/models";

// Admin is auth-gated and personalized — never statically prerender.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  description: "NexBlog admin panel",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await apiServerSafe<ApiUser | null>("/auth/me", null);
  return (
    <div className="min-h-screen flex">
      <Sidebar user={user} />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
