import { Router } from "express";
import {
  deleteNotification,
  getNotification,
  readAllNotification,
  sendNotification,
} from "../controlers/notificationControler.js";

export const notificationRoute = Router();

notificationRoute.post("/sendNotification", sendNotification);
notificationRoute.get("/getNotification/:userId", getNotification);
notificationRoute.post("/readAllNotification/:userId", readAllNotification);
notificationRoute.delete("/deleteNotification/:postId", deleteNotification);
