import mongoose from "mongoose";

const passwordResetSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  userId: { type: String, unique: true },
  email: { type: String, unique: true },
  token: String,
  created_At: Date,
  expier_At: Date,
});

export default mongoose.model("passwordReset", passwordResetSchema);
