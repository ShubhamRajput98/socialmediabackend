import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: String,
    message: String,
    postId: String,
    senderPrfile: { type: String },
    senderName: { type: String },
    read: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("notifications", notificationSchema);
