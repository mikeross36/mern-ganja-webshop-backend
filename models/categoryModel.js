"use strict";
const mongoose = require("mongoose");
const slugify = require("slugify");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: String,
    origin: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      max: 60,
      trim: true,
    },
    cbdToThcRatio: {
      type: String,
      required: true,
      trim: true,
    },
    effectsOfUse: {
      type: String,
      required: true,
      trim: true,
    },
    periodOfUse: {
      type: String,
      trim: true,
    },
    coverImage: {
      type: String,
      required: true,
    },
    ganjas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ganja",
      },
    ],
  },
  { timestamps: true }
);

categorySchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

categorySchema.pre(/^find/, function (next) {
  this.populate({ path: "ganjas", select: "-slug" });
  next();
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
