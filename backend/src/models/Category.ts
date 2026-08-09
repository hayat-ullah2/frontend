import { Schema, model, type InferSchemaType } from "mongoose";
import slugify from "slugify";

const categorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, maxlength: 500 },
    color: { type: String, default: "from-violet-500 to-blue-500" },
    icon: { type: String },
    postCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

categorySchema.pre("validate", function (next) {
  if (this.name && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

export type CategoryDoc = InferSchemaType<typeof categorySchema> & { _id: unknown };
export const Category = model<CategoryDoc>("Category", categorySchema);
