"use strict";
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const mainController = require("./mainController");
const multer = require("multer");
const sharp = require("sharp");

exports.getAllUsers = mainController.getAll(User);
exports.getUser = mainController.getOne(User);
exports.updateUser = mainController.updateOne(User);
exports.deleteUser = mainController.deleteOne(User);

exports.getUserProfile = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

const multerStorage = multer.memoryStorage();

const multerFilter = (req, res, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cd(null, true);
  } else {
    cb(res.status(400).json({ message: "File is not an image!" }), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single("photo");

exports.resizeUserPhoto = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize()
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/images/users/${req.file.filename}`);
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  const fieldNames = Object.keys(obj);
  fieldNames.forEach((field) => {
    if (allowedFields.includes(field)) {
      newObj[field] = obj[field];
    }
  });
  return newObj;
};

exports.updateUserAccount = asyncHandler(async (req, res) => {
  const filteredBody = filterObj(req.body, "name", "email");
  if (req.file) filteredBody.photo = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });
  if (!updatedUser) {
    return res.status(400).json({ message: "User update failed!" });
  }
  return res.status(200).json({ status: "success", updatedUser });
});
