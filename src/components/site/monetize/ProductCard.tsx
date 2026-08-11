import Image from "next/image";
import type { ApiAffiliateLink } from "@/lib/models";
import ProsCons from "./ProsCons";
import OutboundButton from "./OutboundButton";
import Stars from "./Stars";

/**
 * Full recommendation card for a single tool/product: logo, rating, pricing,
 * pros/cons, use cases and a single tracked CTA. Rendered from the affiliate
 * links attached to a post.
 */
export default function ProductCard({
  link,
  postSlug,
  rank,
}: {
  link: ApiAffiliateLink;
  postSlug?: string;
  rank?: number;
}) {
  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-start gap-4">
        {link.logo ? (
          <Image
            src={link.logo}
            alt={`${link.name} logo`}
            width={48}
            height={48}
            className="rounded-xl object-cover h-12 w-12 shrink-0 bg-white/5"
          />
        ) : (
          <div className="h-12 w-12 shrink-0 rounded-xl bg-gradient-accent grid place-items-center text-white font-bold">
            {link.name.charAt(0)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {rank !== undefined && (
              <span className="text-xs font-bold text-foreground-subtle">#{rank}</span>
            )}
            <h3 className="font-semibold leading-tight">{link.name}</h3>
            {link.badge && <span className="chip-accent text-xs">{link.badge}</span>}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <Stars rating={link.rating} />
            {link.pricingNote && (
              <span className="text-xs text-foreground-subtle">{link.pricingNote}</span>
            )}
          </div>
          {link.tagline && (
            <p className="mt-2 text-sm text-foreground-muted">{link.tagline}</p>
          )}
        </div>
      </div>

      {link.description && (
        <p className="mt-4 text-sm text-foreground-muted leading-relaxed">
          {link.description}
        </p>
      )}

      <ProsCons pros={link.pros} cons={link.cons} className="mt-4" />

      {link.useCases && link.useCases.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground-subtle mb-1.5">
            Best for
          </p>
          <div className="flex flex-wrap gap-2">
            {link.useCases.map((u, i) => (
              <span key={i} className="chip text-xs">
                {u}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5">
        <OutboundButton
          slug={link.slug}
          name={link.name}
          label={link.ctaLabel || `Try ${link.name}`}
          postSlug={postSlug}
        />
      </div>
    </div>
  );
}
