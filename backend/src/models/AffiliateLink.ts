import { Schema, model, type InferSchemaType } from "mongoose";
import slugify from "slugify";

/**
 * An affiliate product / tool the editorial team recommends. The public site
 * never links to `url` directly — outbound traffic flows through the tracked
 * `/go/:slug` redirect so every click is logged and the destination (which may
 * carry an affiliate tag) can be changed in one place without editing articles.
 */
const affiliateLinkSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },

    // Destination — the real (affiliate-tagged) URL. Kept server-side only.
    url: { type: String, required: true, trim: true },

    vendor: { type: String, trim: true, maxlength: 160 },
    logo: { type: String, trim: true },
    // Free-text grouping ("AI writing", "Hosting", "Dev tools") — not a ref, so
    // the affiliate taxonomy can differ from the editorial category taxonomy.
    niche: { type: String, trim: true, maxlength: 120 },

    tagline: { type: String, trim: true, maxlength: 300 },
    description: { type: String, trim: true, maxlength: 2000 },
    pricingNote: { type: String, trim: true, maxlength: 200 }, // "Free plan · $10/mo Pro"
    rating: { type: Number, min: 0, max: 5 },
    badge: { type: String, trim: true, maxlength: 60 }, // "Editor's choice", "Best value"

    pros: [{ type: String, trim: true, maxlength: 240 }],
    cons: [{ type: String, trim: true, maxlength: 240 }],
    useCases: [{ type: String, trim: true, maxlength: 240 }],

    ctaLabel: { type: String, trim: true, maxlength: 60, default: "Visit site" },
    // Whether this is a paid affiliate relationship (drives the disclosure).
    isAffiliate: { type: Boolean, default: true },
    active: { type: Boolean, default: true, index: true },

    // Denormalised click counter for fast EPC/earning views. The authoritative
    // per-click log lives in the Event collection.
    clicks: { type: Number, default: 0 },
    // Optional manual attribution so the dashboard can show real earnings.
    epc: { type: Number, default: 0 }, // earnings per click (USD), manually set
    earnings: { type: Number, default: 0 }, // manually reconciled USD

    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

affiliateLinkSchema.pre("validate", function (next) {
  if (this.name && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

export type AffiliateLinkDoc = InferSchemaType<typeof affiliateLinkSchema> & {
  _id: unknown;
};
export const AffiliateLink = model<AffiliateLinkDoc>(
  "AffiliateLink",
  affiliateLinkSchema,
);
