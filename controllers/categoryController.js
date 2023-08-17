"use strict";
const Category = require("../models/categoryModel");
const mainController = require("./mainController");

exports.getAllCategories = mainController.getAll(Category);
exports.getCategory = mainController.getOne(Category);
exports.createCategory = mainController.createOne(Category);
exports.updateCategory = mainController.updateOne(Category);
exports.deleteCategory = mainController.deleteOne(Category);
