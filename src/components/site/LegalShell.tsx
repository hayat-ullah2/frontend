export default function LegalShell({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <p className="text-xs uppercase tracking-wider text-foreground-subtle">Legal</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">{title}</h1>
      <p className="mt-3 text-sm text-foreground-subtle">Last updated: {updated}</p>
      {intro && <p className="mt-6 text-foreground-muted leading-relaxed">{intro}</p>}
      <div className="prose-article mt-8">{children}</div>
      <p className="mt-12 border-t border-white/5 pt-6 text-xs italic text-foreground-subtle">
        This page is a general template provided for convenience and does not constitute legal
        advice. Please have it reviewed by a qualified professional for your jurisdiction before
        relying on it.
      </p>
    </div>
  );
}
