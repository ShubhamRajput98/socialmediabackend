import { Router } from "express";
import { verifyToken } from "../utils/tokenManager.js";
import {
  createComment,
  createPost,
  createPostVideo,
  deletPost,
  deleteComment,
  deleteReplyComment,
  getComments,
  getLikeComment,
  getLikes,
  getOnePost,
  getPost,
  getReplyComment,
  getUserPost,
} from "../controlers/postControler.js";
import { fileUpload } from "../utils/fileUploade.js";
import express from "express";
import path from "path";

export const postRoute = Router();

postRoute.post(
  "/create-post",
  verifyToken,
  fileUpload("uploads/postImage", "image"),
  createPost
);

postRoute.post(
  "/create-post-video",
  verifyToken,
  fileUpload("uploads/postVideo", "video"),
  createPostVideo
);

// get images
postRoute.use(express.static("uploads"));
const _dirname = path.resolve(path.dirname(""));
postRoute.use("/uploads", express.static(path.join(_dirname, "uploads")));

postRoute.post("/get-all-posts", verifyToken, getPost);
postRoute.get("/:id", verifyToken, getOnePost);
postRoute.get("/get-user-post/:id", verifyToken, getUserPost);
postRoute.post("/likes/:id", verifyToken, getLikes);

// comments
postRoute.get("/get-comments/:postId", verifyToken, getComments);
postRoute.post("/like-comment/:id/:rid?", verifyToken, getLikeComment);
postRoute.post("/create-comment/:postId", verifyToken, createComment);
postRoute.post("/reply-comment/:postId", verifyToken, getReplyComment);

// delete post

postRoute.delete("/deletePost/:postId", verifyToken, deletPost);

// delete comment
postRoute.delete(
  "/deleteComment/:comentId/:postId",
  verifyToken,
  deleteComment
);

// delete comment reply
postRoute.delete(
  "/deleteReplyComment/:comentReplyId/",
  verifyToken,
  deleteReplyComment
);
