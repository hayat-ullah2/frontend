import type { Metadata } from "next";
import UnsubscribeClient from "@/components/site/UnsubscribeClient";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Unsubscribe",
  description: `Unsubscribe from ${SITE_NAME} emails.`,
  robots: { index: false, follow: false },
};

export default async function UnsubscribePage(props: {
  searchParams: Promise<{ email?: string | string[] }>;
}) {
  const sp = await props.searchParams;
  const raw = sp.email;
  const email = (Array.isArray(raw) ? raw[0] : raw) ?? "";

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8 py-24">
      <h1 className="text-3xl font-bold tracking-tight">Unsubscribe</h1>
      <p className="mt-2 text-sm text-foreground-subtle">
        We&apos;re sorry to see you go.
      </p>
      <div className="mt-8">
        <UnsubscribeClient email={email} />
      </div>
    </div>
  );
}
