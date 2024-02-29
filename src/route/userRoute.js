import { Router } from "express";
import path from "path";

import {
  loginValidater,
  signupValidater,
  validate,
} from "../utils/validater.js";
import {
  acceptRequest,
  changePassword,
  getFriendRequest,
  getUsers,
  requestPasswordChange,
  resetPassword,
  sendFriendRequest,
  suggestFriends,
  updateUser,
  userLogin,
  userSignUp,
  verifyEmail,
  veryfyUser,
  viewProfile,
} from "../controlers/userControler.js";
import { verifyToken } from "../utils/tokenManager.js";
import { fileUpload } from "../utils/fileUploade.js";
import express from "express";

const _dirname = path.resolve(path.dirname(""));

export const userRoute = Router();

userRoute.post("/Signup", validate(signupValidater), userSignUp);
userRoute.post("/Login", validate(loginValidater), userLogin);
userRoute.get("/authStatus", verifyToken, veryfyUser);
userRoute.get("/get-user/:userId", verifyToken, getUsers);

// update user
userRoute.post(
  "/update-user/:userId",
  verifyToken,
  fileUpload("uploads/userImage", "profileUrl"),
  updateUser
);

// get images
userRoute.use(express.static("uploads"));

// profile view
userRoute.post("/view-profile", verifyToken, viewProfile);
userRoute.post("/suggest-friend", verifyToken, suggestFriends);

// email verification
userRoute.get("/verification/:userId/:token", verifyEmail);
userRoute.get("/verification", (req, res) => {
  res.sendFile(path.join(_dirname, "./src/views/verifiedpage.html"));
});

// reset password
userRoute.post("/request-reset-password", requestPasswordChange);

userRoute.get("/reset-password/:userId/:token", resetPassword);

userRoute.post("/change-password", changePassword);

userRoute.get("/resetPassword", (req, res) => {
  res.sendFile(path.join(_dirname, "./src/views/resetPassword.html"));
});

// sent friend request

userRoute.post("/friend-request", verifyToken, sendFriendRequest);
userRoute.post("/get-friend-request", verifyToken, getFriendRequest);
userRoute.post("/accept-friend-request", verifyToken, acceptRequest);
