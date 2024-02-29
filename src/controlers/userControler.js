import users from "../model/user.js";
import { hash, compare } from "bcrypt";
import { createToken } from "../utils/tokenManager.js";
import { COOKIE_NAME } from "../utils/constanse.js";
import { sendMail, sendResetPassword } from "../utils/sendMail.js";
import emaiVerification from "../model/emaiVerification.js";
import friendRequest from "../model/friendRequest.js";
import fs from "fs";

import passwordReset from "../model/passwordReset.js";

export const userSignUp = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const exsitinguser = await users.findOne({ email });
    if (exsitinguser) return res.status(401).json({ status: 401 });
    const hashedpassword = await hash(password, 10);
    const user = new users({ name, email, password: hashedpassword });
    await user.save();

    // store token in cookie

    res.clearCookie(COOKIE_NAME, {
      path: "/",
      domain: "localhost",
      httpOnly: true,
      signed: true,
    });

    // create token for users
    const token = createToken(user._id.toString(), user.email, "7d");

    // token expier days
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);

    // set token in cookie
    res.cookie(COOKIE_NAME, token, {
      path: "/",
      domain: "localhost",
      expires,
      httpOnly: true,
      signed: true,
    });

    // delete password before send res
    const userData = {
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      location: user.location,
      profileUrl: user.profileUrl,
      profession: user.profession,
      friends: user.friends,
      views: user.views,
      verified: user.verified,
    };

    // send verification mail

    sendMail(user._id.toString(), name, email, token, res, userData);
  } catch (error) {
    console.log(error);
    return res.status(200).json({ error: error.message });
  }
};

export const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await users.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "User not registered" });
    }
    const isPasswordCorect = await compare(password, user.password);
    if (!isPasswordCorect) {
      return res.status(200).json({ message: "Incoreact password" });
    }

    if (!user?.verified) {
      return res.status(403).json({
        error:
          "Email is not verified please check your email to verify your email",
      });
    }

    res.clearCookie(COOKIE_NAME, {
      path: "/",
      domain: "localhost",
      httpOnly: true,
      signed: true,
    });

    // create token for users
    const token = createToken(user._id.toString(), user.email, "7d");

    // token expier days
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);

    // set token in cookie
    res.cookie(COOKIE_NAME, token, {
      path: "/",
      domain: "localhost",
      expires,
      httpOnly: true,
      signed: true,
    });

    // delete password before send res
    const userData = {
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      location: user.location,
      profileUrl: user.profileUrl,
      profession: user.profession,
      friends: user.friends,
      views: user.views,
      verified: user.verified,
    };

    return res.status(201).json({
      success: true,
      message: "Login successfully",
      user: userData,
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ error: error.message });
  }
};

export const veryfyUser = async (req, res, next) => {
  try {
    const user = await users.findById(res.locals.jwtData.id);

    if (!user) {
      return res
        .status(401)
        .json({ error: "User not registered or token malfunction" });
    }

    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).json({ error: "Permison didn't match" });
    }

    // delete password before send res
    const userData = {
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      location: user.location,
      profileUrl: user.profileUrl,
      profession: user.profession,
      friends: user.friends,
      views: user.views,
      verified: user.verified,
    };

    return res.status(201).json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ error: error.message });
  }
};

// get user
export const getUsers = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await users.findById(userId);
    if (user) {
      // delete password before send res
      const userData = {
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        location: user.location,
        profileUrl: user.profileUrl,
        profession: user.profession,
        friends: user.friends,
        views: user.views,
        verified: user.verified,
      };
      return res.status(200).json({ success: true, user: userData });
    } else {
      return res.status(400).json({ error: "User not found" });
    }
  } catch (error) {
    return res.status(200).json({ error: error.message });
  }
};

// update user
export const updateUser = async (req, res) => {
  const { userId } = req.params;
  const reqBody = req.body;

  if (reqBody?.profileUrl == "null" || reqBody?.profileUrl == null) {
    delete reqBody?.profileUrl;
  }

  console.log(req?.file);

  // if file havet then push file into reqBody then process update

  let imgUrl = "";
  if (req?.file) {
    imgUrl = `userImage/${req.file.filename}`;
    reqBody.profileUrl = imgUrl;
  }

  try {
    const user = await users.findById(userId);
    if (reqBody.profileUrl && user?.profileUrl)
      fs.unlinkSync("uploads/" + user?.profileUrl);

    const updateUser = await users.findByIdAndUpdate({ _id: userId }, reqBody, {
      new: true,
    });

    await updateUser.save();

    const updatedUser = await users.findById(userId);
    const userData = {
      userId: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      location: updatedUser.location,
      profileUrl: updatedUser.profileUrl,
      profession: updatedUser.profession,
      friends: updatedUser.friends,
      views: updatedUser.views,
      verified: updatedUser.verified,
    };

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: userData,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error.message });
  }
};

// vefify email

export const verifyEmail = async (req, res, next) => {
  const { userId, token } = req.params;

  try {
    const data = await emaiVerification.findOne({ userId });

    if (data) {
      const { expier_At } = data;

      if (expier_At < Date.now()) {
        await users.findOneAndDelete({ _id: userId });

        const message = "Verification token has expired";
        return res.redirect(
          `http://localhost:5500/socialmedia/user/verification?status=error&message=${message}`
        );
      } else {
        const hasToken = await hash(token, 10);
        const isTokenMatch = await compare(data.token, hasToken);

        if (isTokenMatch) {
          await users.findOneAndUpdate({ _id: userId }, { verified: true });

          const message = "Email verified successfully";
          return res.redirect(
            `http://localhost:5500/socialmedia/user/verification?status=success&message=${message}`
          );
        } else {
          const message = "Verification failed or link is invalid";
          return res.redirect(
            `http://localhost:5500/socialmedia/user/verification?status=error&message=${message}`
          );
        }
      }
    } else {
      const message = "Invalid verification link. Try again later";
      return res.redirect(
        `http://localhost:5500/socialmedia/user/verification?status=error&message=${message}`
      );
    }
  } catch (error) {
    console.error(error);
    // Handle other errors here if needed
    return res.status(500).json({ error: error.message });
  }
};

// reset password
export const requestPasswordChange = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await users.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: "Faield", message: "Email adress not found" });
    }

    const exsitingRequest = await passwordReset.findOne({ email });

    if (exsitingRequest) {
      // if (exsitingRequest.expier_At > Date.now) {
      return res.status(201).json({
        status: "Pending",
        message: "Reset password link has already been sent to your email.",
      });
      // }
    }

    await passwordReset.findOneAndDelete({ email });

    const token = createToken(user._id.toString(), user.email, "7d");

    await sendResetPassword(user._id, email, token, res);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { userId, token } = req.params;

  try {
    const user = users.findById(userId);

    if (!user) {
      const message = "Invalid password reset link. try again";
      return res.redirect(
        `http://localhost:5500/socialmedia/user/resetPassword?status=error&message=${message}`
      );
    }

    const reset = await passwordReset.findOne({ userId });

    if (!reset) {
      const message = "Invalid password reset link. try again";
      return res.redirect(
        `http://localhost:5500/socialmedia/user/resetPassword?status=error&message=${message}`
      );
    }

    const { expier_At, token: resetToken } = reset;

    if (expier_At < Date.now()) {
      const message = "Reset password link has expired. Please try again";
      return res.redirect(
        `http://localhost:5500/socialmedia/user/resetPassword?status=error&message=${message}`
      );
    } else {
      const hasToken = await hash(token, 10);

      const isTokenMatch = await compare(resetToken, hasToken);

      if (!isTokenMatch) {
        const message = "Invalid password reset link. try again";
        return res.redirect(
          `http://localhost:5500/socialmedia/user/resetPassword?status=error&message=${message}`
        );
      } else {
        return res.redirect(
          `http://localhost:5500/socialmedia/user/resetPassword?type=reset&id=${userId}`
        );
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { userId, password } = req.body;

    const hashedpassword = await hash(password, 10);

    const user = await users.findByIdAndUpdate(
      userId,
      { password: hashedpassword },
      { new: true }
    );

    if (user) {
      await passwordReset.findOneAndDelete({ userId });
      const message = "Password successfully reset";
      return res.status(200).json({
        url: `http://localhost:5500/socialmedia/user/verification?status=success&message=${message}`,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

// friend request

export const sendFriendRequest = async (req, res) => {
  try {
    const { requestTo, userId } = req.body;

    const requestExist = await friendRequest.findOne({
      requestFrom: userId,
      requestTo,
    });

    if (requestExist) {
      return res.status(412).json({ message: "Friend request already sent." });
    }

    const accountExist = await friendRequest.findOne({
      requestTo,
      requestFrom: userId,
    });

    if (accountExist) {
      return res.status(412).json({ message: "Friend request already sent." });
    }

    const request = new friendRequest({
      requestTo,
      requestFrom: userId,
    });

    await request.save();
    return res.status(200).json({ message: "Friend request sent." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

export const getFriendRequest = async (req, res) => {
  try {
    const { userId } = req.body;

    const request = await friendRequest
      .find({
        requestTo: userId,
        requestStatus: "Pending",
      })
      .populate({
        path: "requestFrom",
        select: "name profileUrl profession",
      })
      .limit(10)
      .sort({ _id: -1 });

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

export const acceptRequest = async (req, res) => {
  try {
    const { userId, rid, status } = req.body;

    const requsetExist = await friendRequest.findById(rid);
    if (!requsetExist) {
      return res.status(404).json({ status: 400, message: "No request fount" });
    }

    const newRes = await friendRequest.findByIdAndUpdate(
      { _id: rid },
      { requestStatus: status }
    );

    if (status === "Accepted") {
      const user = await users.findById(userId);
      const userData = await users.findById(newRes?.requestFrom);
      const data1 = {
        _id: userData._id.toString(),
        name: userData.name,
        profileUrl: userData.profileUrl,
        profession: userData.profession,
      };
      user.friends.push(data1);

      await user.save();

      const friend = await users.findById(newRes?.requestFrom);
      const requestToFriend = await users.findById(newRes?.requestTo);

      const data2 = {
        _id: requestToFriend._id.toString(),
        name: requestToFriend.name,
        profileUrl: requestToFriend.profileUrl,
        profession: requestToFriend.profession,
      };

      friend.friends.push(data2);

      await friend.save();

      return res.status(200).json({
        success: true,
        message: `Friend Request ${status}`,
      });
    } else {
      await friendRequest.findByIdAndDelete(rid);
      return res.status(200).json({
        success: true,
        message: `Friend Request ${status}`,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

// view profile

export const viewProfile = async (req, res) => {
  try {
    const { id, userId } = req.body;

    if (id === userId) {
      return;
    }

    const user = await users.findById(id);
    if (!user.views.includes(userId)) {
      user.views.push(userId);
    }

    await user.save();

    return res.status(200).json({ success: true, message: "Success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

// suggest friend

export const suggestFriends = async (req, res) => {
  try {
    const { userId } = req.body;
    let queryObject = {};
    queryObject._id = { $ne: userId };
    // queryObject.friends = { $nin: userId };
    let queryResult = await users
      .find(queryObject)
      .limit(15)
      .select("name profileUrl profession");

    const suggestFriend = await queryResult;

    return res.status(200).json({
      success: true,
      data: suggestFriend,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};
