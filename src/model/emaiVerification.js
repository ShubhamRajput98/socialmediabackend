import mongoose from "mongoose";

const emailVerificationSchema = new mongoose.Schema({
  userId: String,
  token: String,
  created_At: Date,
  expier_At: Date,
});

export default mongoose.model("emailVerification", emailVerificationSchema);
