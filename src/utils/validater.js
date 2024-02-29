import { body, validationResult } from "express-validator";

export const validate = (validations) => {
  return async (req, res, next) => {
    for (let validtion of validations) {
      const result = await validtion.run(req);
      if (!result.isEmpty()) {
        break;
      }
    }
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      return next();
    }
    return res.status(422).json({ error: errors.array() });
  };
};

export const loginValidater = [
  body("email").trim().isEmail().withMessage("email is reqired"),
  body("password")
    .trim()
    .isLength({ min: 6 })
    .withMessage("password contains 6 characters"),
];

export const signupValidater = [
  body("name").notEmpty().withMessage("name is required"),
  ...loginValidater,
];

export const messageValidater = [
  body("message").notEmpty().withMessage("message is required"),
];
