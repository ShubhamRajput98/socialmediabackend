import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "posts" },
    comment: { type: String, require: true },
    from: { type: String, require: true },
    likes: [{ type: String }],
    replies: [
      {
        rId: { type: mongoose.Schema.Types.ObjectId },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
        from: { type: String, require: true },
        replyAt: { type: String },
        comment: { type: String },
        created_At: { type: Date, default: Date.now() },
        updated_At: { type: Date, default: Date.now() },
        likes: [{ type: String }],
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("comments", commentSchema);
