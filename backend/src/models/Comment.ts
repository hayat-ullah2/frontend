import { Schema, model, type InferSchemaType } from "mongoose";

const commentSchema = new Schema(
  {
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    parent: { type: Schema.Types.ObjectId, ref: "Comment", default: null, index: true },
    content: { type: String, required: true, maxlength: 4000 },
    status: {
      type: String,
      enum: ["approved", "pending", "flagged", "rejected"],
      default: "pending",
      index: true,
    },
    likes: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export type CommentDoc = InferSchemaType<typeof commentSchema> & { _id: unknown };
export const Comment = model<CommentDoc>("Comment", commentSchema);
