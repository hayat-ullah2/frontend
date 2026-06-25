import type { Metadata } from "next";
import Sidebar from "@/components/admin/Sidebar";

export const metadata: Metadata = {
  title: "Admin",
  description: "NexBlog admin panel",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
