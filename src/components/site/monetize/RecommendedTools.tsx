import type { ApiAffiliateLink } from "@/lib/models";
import AffiliateDisclosure from "./AffiliateDisclosure";
import ComparisonTable from "./ComparisonTable";
import ProductCard from "./ProductCard";

/**
 * The full "Recommended tools" block rendered inside an article from the
 * affiliate links attached to the post: disclosure → comparison → detail cards.
 * Renders nothing when the post has no affiliate links, so it's safe to always
 * include on the post page.
 */
export default function RecommendedTools({
  links,
  postSlug,
  title = "Recommended tools",
}: {
  links?: ApiAffiliateLink[];
  postSlug?: string;
  title?: string;
}) {
  const active = (links ?? []).filter((l) => l.active !== false);
  if (active.length === 0) return null;

  const hasAffiliate = active.some((l) => l.isAffiliate !== false);

  return (
    <section className="mt-12" aria-label={title}>
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      {hasAffiliate && <AffiliateDisclosure className="mt-3" />}

      {active.length >= 2 && (
        <div className="mt-5">
          <ComparisonTable links={active} postSlug={postSlug} />
        </div>
      )}

      <div className="mt-6 space-y-5">
        {active.map((l, i) => (
          <ProductCard key={l._id} link={l} postSlug={postSlug} rank={i + 1} />
        ))}
      </div>
    </section>
  );
}
