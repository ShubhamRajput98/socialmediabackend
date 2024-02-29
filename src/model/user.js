import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
  },
  password: {
    type: String,
    require: true,
  },
  location: {
    type: String,
  },
  profileUrl: { type: String },
  profession: { type: String },
  friends: [{ type: Object, ref: "users" }],
  views: [{ type: String }],
  verified: { type: Boolean, default: false },
});

export default mongoose.model("users", userSchema);
