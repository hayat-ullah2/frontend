import type { ApiAffiliateLink } from "@/lib/models";
import OutboundButton from "./OutboundButton";
import Stars from "./Stars";

/**
 * At-a-glance comparison of the recommended tools. Complements the detailed
 * ProductCards with a scannable "which one should I pick" table.
 */
export default function ComparisonTable({
  links,
  postSlug,
}: {
  links: ApiAffiliateLink[];
  postSlug?: string;
}) {
  if (links.length < 2) return null;
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full text-sm min-w-[560px]">
        <thead className="text-xs text-foreground-subtle bg-white/[0.03]">
          <tr>
            <th className="text-left p-4 font-medium">Tool</th>
            <th className="text-left p-4 font-medium">Rating</th>
            <th className="text-left p-4 font-medium">Pricing</th>
            <th className="text-left p-4 font-medium hidden sm:table-cell">Best for</th>
            <th className="text-right p-4 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {links.map((l) => (
            <tr key={l._id} className="border-t border-white/5">
              <td className="p-4">
                <div className="font-medium">{l.name}</div>
                {l.badge && (
                  <span className="text-xs text-violet-300">{l.badge}</span>
                )}
              </td>
              <td className="p-4">
                <Stars rating={l.rating} />
              </td>
              <td className="p-4 text-foreground-muted">{l.pricingNote ?? "—"}</td>
              <td className="p-4 text-foreground-muted hidden sm:table-cell">
                {l.useCases?.[0] ?? l.tagline ?? "—"}
              </td>
              <td className="p-4 text-right">
                <OutboundButton
                  slug={l.slug}
                  name={l.name}
                  label="View"
                  variant="ghost"
                  postSlug={postSlug}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
