import { Schema, model, type InferSchemaType } from "mongoose";

const contactMessageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, lowercase: true, trim: true },
    subject: { type: String, trim: true, maxlength: 200 },
    topic: {
      type: String,
      enum: ["general", "pitch", "partnerships", "press", "corrections"],
      default: "general",
    },
    message: { type: String, required: true, maxlength: 5000 },
    status: {
      type: String,
      enum: ["new", "read", "archived"],
      default: "new",
      index: true,
    },
  },
  { timestamps: true },
);

export type ContactMessageDoc = InferSchemaType<typeof contactMessageSchema> & {
  _id: unknown;
};
export const ContactMessage = model<ContactMessageDoc>(
  "ContactMessage",
  contactMessageSchema,
);
