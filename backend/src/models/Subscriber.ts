import { Schema, model, type InferSchemaType } from "mongoose";

const subscriberSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    source: { type: String, default: "site" },
    confirmed: { type: Boolean, default: false },
    unsubscribedAt: { type: Date },
  },
  { timestamps: true },
);

export type SubscriberDoc = InferSchemaType<typeof subscriberSchema> & { _id: unknown };
export const Subscriber = model<SubscriberDoc>("Subscriber", subscriberSchema);
