"use strict";
const express = require("express");
const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(reviewController.getAllReviews)
  .post(
    authController.tokenProtect,
    authController.restrictTo("user", "admin"),
    reviewController.setGanjaUserIds,
    reviewController.createReview
  );

router.use(authController.tokenProtect);

router
  .route("/:id")
  .get(reviewController.getReview)
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);

module.exports = router;
