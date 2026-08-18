import { Schema, model, type InferSchemaType } from "mongoose";
import slugify from "slugify";

const postSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 240 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    excerpt: { type: String, maxlength: 500 },
    content: { type: String, required: true },
    cover: { type: String },
    coverPublicId: { type: String },

    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    // Internal ownership — the admin/user account that created the post.
    author: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    // PUBLIC display author (the legitimate writer the SEO/content team assigns).
    // Separate from `author` above — the admin who creates a post is NOT
    // automatically its public author. Empty = no author shown (never falls back
    // to the admin account name).
    authorName: { type: String, trim: true, maxlength: 120 },

    status: {
      type: String,
      enum: ["draft", "published", "scheduled", "archived"],
      default: "draft",
      index: true,
    },
    publishedAt: { type: Date, index: true },
    featured: { type: Boolean, default: false },
    trending: { type: Boolean, default: false },

    readingTime: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    likedBy: [{ type: Schema.Types.ObjectId, ref: "User", index: true }],
    bookmarkedBy: [{ type: Schema.Types.ObjectId, ref: "User", index: true }],

    seo: {
      title: String,
      description: String,
      canonical: String,
      ogImage: String,
      noindex: { type: Boolean, default: false },
    },

    // ── SEO Content Optimization & Geo-Targeting ──────────────────────────
    primaryKeyword: { type: String, trim: true, maxlength: 120 },
    secondaryKeywords: [{ type: String, trim: true, maxlength: 120 }],
    searchIntent: {
      type: String,
      enum: ["informational", "commercial", "transactional", "navigational"],
    },
    // Default to the US market — highest AdSense value and our primary audience.
    targetCountries: { type: [{ type: String, trim: true, lowercase: true }], default: ["us"] }, // country codes: us, ca, au…
    targetLanguage: { type: String, trim: true, default: "en-US" }, // e.g. en-US
    contentCluster: {
      name: { type: String, trim: true, maxlength: 120 },
      pillar: { type: Boolean, default: false },
    },
    // Links this post to a canonical "original" when it is a localized variant.
    localizedFrom: { type: Schema.Types.ObjectId, ref: "Post" },

    // ── Monetization ──────────────────────────────────────────────────────
    // Products/tools recommended in this article, rendered as tracked cards.
    affiliateLinks: [{ type: Schema.Types.ObjectId, ref: "AffiliateLink" }],
    // FAQ block — also emitted as FAQPage JSON-LD for rich results.
    faqs: [
      {
        _id: false,
        question: { type: String, trim: true, maxlength: 300 },
        answer: { type: String, trim: true, maxlength: 2000 },
      },
    ],

    // Server-authoritative analysis snapshot (recomputed on save/publish).
    seoScore: { type: Number, min: 0, max: 100, default: 0, index: true },
    seoScores: {
      keyword: Number,
      structure: Number,
      metadata: Number,
      readability: Number,
      links: Number,
      images: Number,
    },
    seoStatus: {
      type: String,
      enum: ["excellent", "good", "needs-improvement", "poor"],
    },
    seoIssues: [
      {
        _id: false,
        id: String,
        severity: { type: String, enum: ["error", "warning", "good"] },
        category: String,
        message: String,
      },
    ],
    seoAnalyzedAt: { type: Date },
  },
  { timestamps: true },
);

postSchema.pre("validate", function (next) {
  if (this.title && !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  if (this.content && (!this.readingTime || this.readingTime === 0)) {
    const words = this.content.split(/\s+/).filter(Boolean).length;
    this.readingTime = Math.max(1, Math.round(words / 220));
  }
  next();
});

postSchema.index({ title: "text", excerpt: "text", content: "text" });

export type PostDoc = InferSchemaType<typeof postSchema> & { _id: unknown };
export const Post = model<PostDoc>("Post", postSchema);
