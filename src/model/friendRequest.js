import mongoose, { Schema } from "mongoose";

const friendRequestSchema = new mongoose.Schema(
  {
    requestTo: { type: Schema.Types.ObjectId, ref: "users", require: true },
    requestFrom: { type: Schema.Types.ObjectId, ref: "users", require: true },
    requestStatus: { type: String, default: "Pending" },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("friendRequest", friendRequestSchema);
