import mongoose from "mongoose";
import comment from "../model/comment.js";
import posts from "../model/post.js";
import users from "../model/user.js";
import fs from "fs";

export const createPost = async (req, res) => {
  try {
    const { userId, description } = req.body;

    // Check if userId and description are provided
    if (!userId) {
      return res.status(400).json({ status: 400, error: "User id not found" });
    }
    if (!description) {
      return res
        .status(400)
        .json({ status: 400, error: "Please provide description" });
    }

    // image
    let imgUrl = "";

    if (req.file) {
      // Ensure the file is an image before setting the imgUrl
      if (
        !req.file.mimetype.startsWith("image") ||
        req.file.size > 2 * 1024 * 1024 // 2MB limit
      ) {
        return res.status(400).json({
          error: "Invalid image file. Please upload a valid image (max 2MB).",
        });
      }

      imgUrl = `postImage/${req.file.filename}`;
    }

    const post = new posts({
      userId,
      description,
      image: imgUrl,
    });

    await post.save();

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createPostVideo = async (req, res) => {
  try {
    const { userId, description } = req.body;

    // Check if userId and description are provided
    if (!userId) {
      return res.status(400).json({ status: 400, error: "User id not found" });
    }
    if (!description) {
      return res
        .status(400)
        .json({ status: 400, error: "Please provide description" });
    }

    let videoPath = [];

    console.log(req.file);

    if (req.file) {
      // Ensure the file is a video before setting the videoPath
      if (!req.file.mimetype.startsWith("video")) {
        return res.status(400).json({
          error: "Invalid video file.",
        });
      }

      videoPath.push("/" + req.file.path);
    }

    // Create a new post with video information
    const post = new posts({
      userId,
      description,
      video: videoPath,
    });

    // Save the post to the database
    await post.save();

    // Respond with success message and created post
    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getPost = async (req, res) => {
  try {
    const { userId, search } = req.body;

    const user = await users.findById(userId);
    const friend = user?.friends?.toString().split(",") ?? [];
    friend.push(userId);

    const searchPostQuery = {
      $or: [{ description: { $regex: search, $options: "i" } }],
    };

    const post = await posts
      .find(search ? searchPostQuery : {})
      .populate({
        path: "userId",
        select: "name location profileUrl",
      })
      .sort({ _id: -1 });

    // const friendPost = post?.filter((post) =>
    //   friend.includes(post?.userId?._id?.toString())
    // );

    // const otherPost = post?.filter(
    //   (post) => !friend.includes(post?.userId?._id?.toString())
    // );

    // let postRes = null;

    // if (friendPost?.length > 0) {
    //   postRes = search ? friendPost : [...otherPost, ...friendPost];
    // } else {
    //   postRes = post;
    // }

    return res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({ error: error.message });
  }
};

export const getOnePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await posts.find({ _id: id }).populate({
      path: "userId",
      select: "name location profileUrl",
    });

    if (post) return res.status(200).json({ success: true, post });

    return res.status(404).json({ error: "Post not found" });
  } catch (error) {
    console.log(error);
    return res.status(404).json({ error: error.message });
  }
};

export const getUserPost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await posts
      .find({ userId: id })
      .populate({
        path: "userId",
        select: "name location profileUrl",
      })
      .sort({ _id: -1 });
    if (post) return res.status(200).json({ success: true, post });

    return res.status(404).json({ error: "Post not found" });
  } catch (error) {
    console.log(error);
    return res.status(404).json({ error: error.message });
  }
};

export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const postComments = await comment
      .find({ postId })
      .populate({
        path: "userId",
        select: "name location profileUrl",
      })
      .populate({
        path: "replies.userId",
        select: "name location profileUrl",
      })
      .sort({ _id: -1 });

    return res.status(200).json({ success: true, postComments });
  } catch (error) {
    console.log(error);
    return res.status(404).json({ error: error.message });
  }
};

export const getLikes = async (req, res) => {
  try {
    const { userId } = req.body;
    const { id } = req.params;

    const post = await posts.findById(id);
    const index = post?.likes?.findIndex((pid) => pid === String(userId));
    if (index === -1) {
      post.likes.push(userId);
    } else {
      post.likes = post.likes.filter((pid) => pid !== String(userId));
    }
    const newPost = await posts.findByIdAndUpdate(id, post);

    return res.status(200).json({ success: true, newPost });
  } catch (error) {
    console.log(error);
    return res.status(404).json({ error: error.message });
  }
};

export const getLikeComment = async (req, res) => {
  try {
    const { id, rid } = req.params;
    const { userId } = req.body;

    if (!rid || rid === undefined || rid === null || rid === "false") {
      const comments = await comment.findById(id);
      const index = comments.likes.findIndex((el) => el === String(userId));

      if (index === -1) {
        comments.likes.push(userId);
      } else {
        comments.likes = comments.likes.filter((el) => el !== String(userId));
      }

      const update = await comment.findByIdAndUpdate(id, comments, {
        new: true,
      });

      return res.status(200).json({ success: true, update });
    } else {
      const replyComments = await comment.findOne(
        { _id: id },
        {
          replies: { $elemMatch: { _id: rid } },
        }
      );

      const index = replyComments?.replies[0]?.likes.findIndex(
        (i) => i === String(userId)
      );

      if (index === -1) {
        replyComments.replies[0].likes.push(userId);
      } else {
        replyComments.replies[0].likes = replyComments.replies[0].likes.filter(
          (i) => i !== String(userId)
        );
      }

      const query = { _id: id, "replies._id": rid };
      const updated = {
        $set: {
          "replies.$.likes": replyComments.replies[0].likes,
        },
      };

      const result = await comment.updateOne(query, updated, { new: true });
      return res.status(200).json({ success: true, result });
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({ error: error.message });
  }
};

export const createComment = async (req, res) => {
  try {
    const { commentFrom, from, userId } = req.body;
    const { postId } = req.params;

    if (!commentFrom)
      return res.status(404).json({ error: "Comment is requier" });

    const newComment = new comment({
      comment: commentFrom,
      from,
      userId,
      postId,
    });

    await newComment.save();

    const post = await posts.findById(postId);
    post.comments.push(newComment._id);

    const updatePost = await posts.findByIdAndUpdate(postId, post, {
      new: true,
    });

    return res.status(200).json({ success: true, updatePost });
  } catch (error) {
    console.log(error);
    return res.status(404).json({ error: error.message });
  }
};

export const getReplyComment = async (req, res) => {
  try {
    const { commentFrom, from, userId, replyAt } = req.body;
    const { postId } = req.params;

    if (!commentFrom)
      return res.status(404).json({ error: "Comment is requier" });

    const commentInfo = await comment.findById(postId);

    commentInfo?.replies.push({
      comment: commentFrom,
      from,
      userId,
      replyAt,
      created_At: Date.now(),
    });

    await commentInfo.save();

    return res.status(200).json({ success: true, commentInfo });
  } catch (error) {
    console.log(error);
    return res.status(404).json({ error: error.message });
  }
};

// delete post

export const deletPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await posts.findById(postId);

    if (post.image) fs.unlinkSync("uploads/" + post.image);

    await posts.findByIdAndDelete(postId);

    return res
      .status(200)
      .json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(404).json({ error: error.message });
  }
};

// delete comment

export const deleteComment = async (req, res) => {
  try {
    const { comentId, postId } = req.params;
    const post = await posts.findById(postId);
    if (!post) {
      return res
        .status(200)
        .json({ success: true, message: "Unabel to deleted comment" });
    }

    post.comments = post.comments.filter(
      (item) => item.toString() !== comentId
    );

    await post.save();
    await comment.findByIdAndDelete(comentId);
    return res
      .status(200)
      .json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(404).json({ error: error.message });
  }
};

export const deleteReplyComment = async (req, res) => {
  try {
    const { comentReplyId } = req.params;

    const comments = await comment.findOne({
      "replies._id": new mongoose.Types.ObjectId(comentReplyId),
    });

    comments.replies = comments.replies.filter(
      (item) => item._id.toString() !== comentReplyId
    );

    await comments.save();

    return res
      .status(200)
      .json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(404).json({ error: error.message });
  }
};
