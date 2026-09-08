import { Schema, model, type InferSchemaType } from "mongoose";

// Audit trail for every AI/agent modification to a post's SEO-relevant fields.
// Enables the "View changes / Compare / Revert" requirement. One document per
// applied field change so reverts are granular.

const seoChangeSchema = new Schema(
  {
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    // Groups all field-changes applied together in a single agent action.
    runId: { type: String, required: true, index: true },
    // Which SEO-relevant field changed (dot-path within the post).
    field: { type: String, required: true }, // e.g. "seo.title", "title", "seo.description"
    changeType: {
      type: String,
      enum: ["title", "meta-description", "slug", "alt-text", "internal-link", "faq", "other"],
      default: "other",
    },
    before: { type: String, default: "" },
    after: { type: String, default: "" },
    reason: { type: String, default: "" },
    confidence: { type: String, enum: ["high", "medium", "low"], default: "medium" },
    // Provenance of the recommendation (ai-recommendation, nexversal-internal, …).
    dataSources: { type: [String], default: [] },
    // Who/what applied it and whether an admin explicitly approved.
    appliedBy: { type: Schema.Types.ObjectId, ref: "User" },
    adminApproved: { type: Boolean, default: false },
    mode: { type: String, enum: ["suggest", "auto"], default: "suggest" },
    reverted: { type: Boolean, default: false, index: true },
    revertedAt: { type: Date },
  },
  { timestamps: true },
);

export type SeoChangeDoc = InferSchemaType<typeof seoChangeSchema> & { _id: unknown };
export const SeoChange = model<SeoChangeDoc>("SeoChange", seoChangeSchema);
