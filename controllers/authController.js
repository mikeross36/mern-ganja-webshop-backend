"use strict";
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Email = require("../utils/email");
const { promisify } = require("util");
const crypto = require("crypto");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const sendGeneratedToken = (user, res, statusCode) => {
  const token = generateToken(user._id);
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "development" ? false : true,
    sameSite: process.env.NODE_ENV === "development" ? true : "None",
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
  });
  user.password = undefined;
  return res.status(statusCode).json({ status: "success", token, user });
};

exports.registerUser = asyncHandler(async (req, res) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });
  if (!user) {
    return res.status(400).json({ message: "Invalid user data!" });
  }
  const url = `${req.protocol}://${req.get("host")}/user-profile`;
  await new Email(user, url).sendWelcomeEmail();

  sendGeneratedToken(user, res, 200);
});

exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(401).json({ message: "All the fields are mandatory!" });
  }
  const checkUser = async () => {
    const user = await User.findOne({ email: email }).select("+password");
    if (!user || !(await user.matchPasswords(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    return user;
  };

  const user = await checkUser();
  sendGeneratedToken(user, res, 200);
});

exports.logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
    sameSite: process.env.NODE_ENV === "development" ? true : "None",
    expires: new Date(Date.now() + 1 * 1000),
  });
  res.clearCookie("jwt");
  return res.status(200).json({ status: "success", message: "LOGGED OUT!" });
});

exports.tokenProtect = asyncHandler(async (req, res, next) => {
  const checkToken = async () => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    if (!token) {
      return res.status(401).json({ message: "You are not logged in!" });
    }
    const verified = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    return verified;
  };
  const verified = await checkToken();

  const checkUser = async () => {
    const currUser = await User.findById(verified.id);
    if (!currUser) {
      return res.status(404).json({ message: "User is not logged in!" });
    }
    if (currUser.changedPasswordAfter(verified.iat)) {
      return res
        .status(401)
        .json({ message: "Password is changed! Please login again" });
    }
    return currUser;
  };
  const currUser = await checkUser();
  req.user = currUser;
  next();
});

exports.restrictTo = (...userRoles) => {
  return (req, res, next) => {
    if (!userRoles.includes(req.user.role)) {
      return res.status(401).json({
        message: "You do not have permission to perform this action!",
      });
    }
    next();
  };
};

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    return res
      .status(404)
      .json({ message: "There is no user with this email!" });
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    const resetUrl =
      process.env.NODE_ENV === "development"
        ? `http://127.0.0.1:3000/reset-password/${resetToken}`
        : `https://ganja-webshop/onrender.com/reset-password${resetToken}`;

    await new Email(user, resetUrl).sendPasswordReset();
    return res.status(200).json({
      status: "success",
      message: "Password reset token send by email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res
      .status(500)
      .json({ message: "There was an error sending email!" });
  }
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const resetToken = req.params.token;
  const hashedResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const getUser = async () => {
    const user = await User.findOne({
      passwordResetToken: hashedResetToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    return user;
  };

  const user = await getUser();
  if (!user) {
    return res
      .status(400)
      .json({ message: "Token is invalid or has expired!" });
  }
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  sendGeneratedToken(user, res, 200);
});

exports.updatePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("+password");
  const isMatch = await user.matchPasswords(
    req.body.loginPassword,
    user.password
  );
  if (!isMatch) {
    return res.status(401).json({ message: "Incorrect password!" });
  }
  const setNewPassword = async () => {
    user.password = req.body.password;
    await user.save();
  };
  await setNewPassword();
  sendGeneratedToken(user, res, 200);
});
