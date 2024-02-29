import jwt from "jsonwebtoken";
import { COOKIE_NAME } from "./constanse.js";

export const createToken = (id, email, expiresIn) => {
  const payload = { id, email };
  const token = jwt.sign(payload, process.env.JWT_SECRETS, {
    expiresIn,
  });
  return token;
};

export const verifyToken = async (req, res, next) => {
  const token = req.signedCookies[`${COOKIE_NAME}`];

  try {
    if (!token || token.trim() === "") {
      throw new Error("Token not received");
    }

    const decodedToken = await jwt.verify(token, process.env.JWT_SECRETS);

    console.log("Token verification successful");
    res.locals.jwtData = decodedToken;
    return next();
  } catch (error) {
    console.error(error);

    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ status: 401, message: "Token expired please login again" });
    } else {
      return res.status(401).json({
        status: 401,
        message: "Token verification failed please login again",
      });
    }
  }
};
