import { Schema, model, type InferSchemaType } from "mongoose";

/**
 * First-party, privacy-light analytics event. No IPs, no personal data — just
 * enough to power the revenue dashboard (traffic, outbound/affiliate clicks,
 * CTA conversions, signups). A random client `sessionId` allows de-duplicating
 * without identifying anyone.
 */
export const EVENT_TYPES = [
  "pageview",
  "outbound_click",
  "affiliate_click",
  "cta_click",
  "newsletter_signup",
  "product_click",
] as const;

const eventSchema = new Schema(
  {
    type: { type: String, enum: EVENT_TYPES, required: true, index: true },
    path: { type: String, trim: true, maxlength: 512 },
    postSlug: { type: String, trim: true, index: true },
    affiliateLink: { type: Schema.Types.ObjectId, ref: "AffiliateLink", index: true },
    label: { type: String, trim: true, maxlength: 160 }, // CTA label / product name
    referrer: { type: String, trim: true, maxlength: 512 }, // host only
    country: { type: String, trim: true, maxlength: 4 }, // ISO code if resolvable
    sessionId: { type: String, trim: true, maxlength: 64 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// Primary query pattern: "events of type X in a time window".
eventSchema.index({ type: 1, createdAt: -1 });

export type EventDoc = InferSchemaType<typeof eventSchema> & { _id: unknown };
export const Event = model<EventDoc>("Event", eventSchema);
