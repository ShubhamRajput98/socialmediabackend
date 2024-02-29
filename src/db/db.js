import { connect, disconnect } from "mongoose";

export const connectToDataBase = async () => {
  try {
    await connect(process.env.MONGODB_URL);
    console.log("db connected");
  } catch (error) {
    console.error("Can't connect to MongoDB");
  }
};

export const disconnectFormDataBase = async () => {
  try {
    await disconnect();
    console.log("db disconnected");
  } catch (error) {
    console.error("Can't disconnect to MongoDB");
  }
};
