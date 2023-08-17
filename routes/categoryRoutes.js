"use strict";
const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const authController = require("../controllers/authController");
const ganjaRouter = require("./ganjaRoutes");

router.use("/:categoryId/ganjas", ganjaRouter);

router
  .route("/")
  .get(categoryController.getAllCategories)
  .post(
    authController.tokenProtect,
    authController.restrictTo("admin"),
    categoryController.createCategory
  );

router
  .route("/:id")
  .get(categoryController.getCategory)
  .patch(
    authController.tokenProtect,
    authController.restrictTo("admin"),
    categoryController.updateCategory
  )
  .delete(
    authController.tokenProtect,
    authController.restrictTo("admin"),
    categoryController.deleteCategory
  );

module.exports = router;
