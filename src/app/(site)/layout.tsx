import Footer from "@/components/site/Footer";
import Navbar from "@/components/site/Navbar";
import { apiServerSafe } from "@/lib/apiServer";
import type { ApiUser } from "@/lib/models";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const me = await apiServerSafe<ApiUser | null>("/auth/me", null);

  // Pass a minimal, safe-to-serialize subset to the client navbar.
  // Critical: admins are intentionally treated as anonymous on the public site —
  // never serialize their identity into the page payload, since the layout's
  // props become part of the HTML that all visitors download.
  const safeUser =
    me && me.role !== "admin"
      ? { _id: me._id, name: me.name, avatar: me.avatar }
      : null;

  return (
    <>
      <Navbar user={safeUser} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
