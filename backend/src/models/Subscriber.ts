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
    name: { type: String, trim: true, maxlength: 160 },
    source: { type: String, default: "site" },
    // Which lead magnet (if any) they signed up through — drives delivery.
    leadMagnet: { type: String, trim: true },
    confirmed: { type: Boolean, default: false },
    unsubscribedAt: { type: Date },

    // ── Welcome sequence state ────────────────────────────────────────────
    // Index of the NEXT step to send. `welcomeDone` flips true after the last.
    welcomeStep: { type: Number, default: 0 },
    welcomeDone: { type: Boolean, default: false },
    nextEmailAt: { type: Date, index: true },
    lastEmailedAt: { type: Date },
  },
  { timestamps: true },
);

export type SubscriberDoc = InferSchemaType<typeof subscriberSchema> & { _id: unknown };
export const Subscriber = model<SubscriberDoc>("Subscriber", subscriberSchema);
