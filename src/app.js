import express from "express";
import { config } from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import { appRouter } from "./route/index.js";
config();

const app = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(cookieParser(process.env.COOKIY_SECRETS));

// // midleware
app.use(express.json());
app.use(morgan("dev"));
app.use("/socialmedia", appRouter);

export default app;
