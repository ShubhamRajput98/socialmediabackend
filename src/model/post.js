import mongoose, { Schema } from "mongoose";

const postSchema = new mongoose.Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "users" },
    description: { type: String, require: true },
    image: { type: String },
    video: [{ type: String }],
    likes: [{ type: String }],
    comments: [{ type: Schema.Types.ObjectId, ref: "comments" }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("posts", postSchema);
