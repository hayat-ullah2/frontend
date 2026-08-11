import { Check, Close } from "@/components/Icon";

/** Reusable pros/cons grid — used inside product cards and standalone. */
export default function ProsCons({
  pros = [],
  cons = [],
  className = "",
}: {
  pros?: string[];
  cons?: string[];
  className?: string;
}) {
  if (pros.length === 0 && cons.length === 0) return null;
  return (
    <div className={`grid sm:grid-cols-2 gap-4 ${className}`}>
      {pros.length > 0 && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300 mb-2">
            Pros
          </p>
          <ul className="space-y-1.5">
            {pros.map((p, i) => (
              <li key={i} className="flex gap-2 text-sm text-foreground-muted">
                <Check size={15} className="mt-0.5 shrink-0 text-emerald-400" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {cons.length > 0 && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.05] p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-rose-300 mb-2">
            Cons
          </p>
          <ul className="space-y-1.5">
            {cons.map((c, i) => (
              <li key={i} className="flex gap-2 text-sm text-foreground-muted">
                <Close size={15} className="mt-0.5 shrink-0 text-rose-400" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
