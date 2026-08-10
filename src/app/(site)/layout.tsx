import Footer from "@/components/site/Footer";
import Navbar from "@/components/site/Navbar";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  // The public site is statically rendered (ISR), so the layout must not read
  // request cookies here — doing so forces every page dynamic and breaks static
  // generation. The Navbar fetches the signed-in user client-side instead.
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
