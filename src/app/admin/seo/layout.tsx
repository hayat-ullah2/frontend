import SeoTabs from "./SeoTabs";

export default function SeoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SeoTabs />
      {children}
    </>
  );
}
