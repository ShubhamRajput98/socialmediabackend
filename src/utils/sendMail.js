import nodemailer from "nodemailer";
import emaiVerification from "../model/emaiVerification.js";
import passwordReset from "../model/passwordReset.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "socialmedia98270@gmail.com",
    pass: "zmqe erth yjrv ulqx",
  },
});

export const sendMail = async (id, name, email, token, res, userData) => {
  const link = process.env.APP_URL + "user/verification/" + id + "/" + token;

  const mailOptions = {
    from: "socialmedia98270@gmail.com", // sender address
    to: [email], // list of receivers
    subject: "Verificaion Mail", // Subject line
    html: ` <h2>Email Verification</h2>
    
            <p>Dear ${name},</p>
    
            <p>Thank you for signing up! Please click the link below to verify your email address:${email}</p>
    
            <a href=${link} style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Verify Email</a>
    
            <p>If you did not sign up for our service, you can ignore this email.</p>
    
            <p>Best regards,<br>Socialmedia</p>
    
    `,
  };

  try {
    const expires = new Date();
    expires.setDate(expires.getDate() + 1);
    const newEmailVerification = new emaiVerification({
      userId: id,
      token,
      created_At: Date.now(),
      expier_At: expires,
    });

    await newEmailVerification.save();

    if (newEmailVerification) {
      transporter.sendMail(mailOptions).then(() => {
        res.status(201).send({
          user: userData,
          success: "Pending",
          message:
            "Varification email has been sent to your account. Check your email for further instructions",
        });
      });
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Something went wrong" });
  }
};

export const sendResetPassword = async (id, email, token, res) => {
  const link = process.env.APP_URL + "user/reset-password/" + id + "/" + token;

  const mailOptions = {
    from: "socialmedia98270@gmail.com", // sender address
    to: [email], // list of receivers
    subject: "Reset Password", // Subject line
    html: ` <h2>Reset PasswordReset Password</h2>
    
            <p>Password reset link. Please click the lick below to reset your password</p>
    
            <a href=${link} style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
    
            <p>Best regards,<br>Socialmedia</p>
    
    `,
  };

  try {
    const expires = new Date();
    expires.setDate(expires.getDate() + 1);
    const newEmailResetPassword = new passwordReset({
      email,
      userId: id,
      token,
      created_At: Date.now(),
      expier_At: expires,
    });

    await newEmailResetPassword.save();

    if (newEmailResetPassword) {
      transporter.sendMail(mailOptions).then(() => {
        res.status(201).send({
          success: "Pending",
          message: "Reset password link has been sent to your email account",
        });
      });
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Something went wrong" });
  }
};
