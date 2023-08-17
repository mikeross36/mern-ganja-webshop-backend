"use strict";
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      max: 60,
      trim: true,
    },
    ganja: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ganja",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: "user", select: "name photo" });
  next();
});

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: "ganja", select: "name coverImage" });
  next();
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
