"use strict";
const express = require("express");
const router = express.Router({ mergeParams: true });
const ganjaController = require("../controllers/ganjaController");
const authController = require("../controllers/authController");
const reviewRouter = require("./reviewRoutes");

router.use("/:ganjaId/reviews", reviewRouter);

router
  .route("/")
  .get(ganjaController.getAllGanjas)
  .post(
    authController.tokenProtect,
    authController.restrictTo("admin"),
    ganjaController.createGanja
  );

router
  .route("/:id")
  .get(ganjaController.getGanja)
  .patch(
    authController.tokenProtect,
    authController.restrictTo("admin", "user"),
    ganjaController.updateGanja
  )
  .delete(
    authController.tokenProtect,
    authController.restrictTo("admin"),
    ganjaController.deleteGanja
  );

module.exports = router;
