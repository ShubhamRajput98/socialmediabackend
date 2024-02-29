import { Router } from "express";
import { userRoute } from "./userRoute.js";
import { postRoute } from "./postRoute.js";
import { notificationRoute } from "./notificationroute.js";

export const appRouter = Router();

appRouter.use("/user", userRoute);
appRouter.use("/post", postRoute);
appRouter.use("/notification", notificationRoute);
