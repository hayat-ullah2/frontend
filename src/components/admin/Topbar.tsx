import { Search } from "../Icon";

export default function Topbar({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-white/5">
      <div className="px-6 py-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-xs text-foreground-subtle mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-sm text-foreground-muted w-72">
            <Search size={16} />
            <input
              placeholder="Search admin…"
              className="bg-transparent outline-none border-0 text-foreground placeholder:text-foreground-subtle w-full"
            />
          </div>
          {action}
        </div>
      </div>
    </header>
  );
}
