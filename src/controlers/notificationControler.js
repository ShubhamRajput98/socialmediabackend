import notification from "../model/notification.js";
import users from "../model/user.js";

export const sendNotification = async (req, res) => {
  try {
    const { userId, postId, message } = req.body;

    // get user data
    const userData = await users.findOne({ _id: userId });

    // get user profile and name
    const senderPrfile = userData?.profileUrl && userData?.profileUrl;
    const senderName = userData?.name && userData?.name;

    // store user fiends id in array
    let userFriendsId = [];

    userData.friends.map((friend) => {
      userFriendsId.push(friend._id);
    });

    userFriendsId.map(async (userId) => {
      const newNotification = new notification({
        userId,
        message,
        postId,
        senderPrfile,
        senderName,
      });
      await newNotification.save();
    });

    res.status(201).send({ message: "Notification send successfully" });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const getNotification = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await notification.find({ userId });
    const reverse = notifications.reverse((a, b) => a - b);
    res.status(200).json({ success: true, data: reverse });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const readAllNotification = async (req, res) => {
  try {
    const { userId } = req.params;
    await notification.updateMany({ userId }, { read: true });
    res.status(200).send({ message: "Update notification" });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { postId } = req.params;

    await notification.deleteMany({ postId });
    return res
      .status(200)
      .json({ success: true, message: "Notification deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
};
