"use strict";
const mongoose = require("mongoose");
const slugify = require("slugify");

const ganjaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    dateTested: {
      type: Date,
      default: Date.now(),
    },
    thca: {
      type: String,
      required: true,
    },
    thc: {
      type: String,
      required: true,
    },
    cbda: {
      type: String,
      required: true,
    },
    cbd: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    description: String,
    packings: [],
    prices: [],
    coverImage: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 4,
    },
    slug: String,
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

ganjaSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

ganjaSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "ganja",
  localField: "_id",
});

const Ganja = mongoose.model("Ganja", ganjaSchema);

module.exports = Ganja;
