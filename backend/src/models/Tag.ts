import { Schema, model, type InferSchemaType } from "mongoose";
import slugify from "slugify";

const tagSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    postCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

tagSchema.pre("validate", function (next) {
  if (this.name && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

export type TagDoc = InferSchemaType<typeof tagSchema> & { _id: unknown };
export const Tag = model<TagDoc>("Tag", tagSchema);
