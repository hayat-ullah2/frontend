import bcrypt from "bcryptjs";
import { Schema, model, type InferSchemaType, type Model } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, select: false, minlength: 8 },
    role: {
      type: String,
      enum: ["admin", "editor", "writer", "reader"],
      default: "reader",
      index: true,
    },
    avatar: { type: String },
    avatarPublicId: { type: String },
    bio: { type: String, maxlength: 600 },
    // Public author title / credentials for E-E-A-T, e.g.
    // "Indie developer · 8 yrs building SaaS". Distinct from the permission role.
    title: { type: String, trim: true, maxlength: 120 },
    status: {
      type: String,
      enum: ["active", "pending", "banned"],
      default: "active",
    },
    socials: {
      twitter: String,
      github: String,
      linkedin: String,
      website: String,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export type UserDoc = InferSchemaType<typeof userSchema> & {
  _id: unknown;
  comparePassword(candidate: string): Promise<boolean>;
};

export const User = model<UserDoc, Model<UserDoc>>("User", userSchema);
