"use strict";
const Ganja = require("../models/ganjaModel");
const mainController = require("./mainController");

exports.getAllGanjas = mainController.getAll(Ganja);
exports.getGanja = mainController.getOne(Ganja, { path: "reviews" });
exports.createGanja = mainController.createOne(Ganja);
exports.updateGanja = mainController.updateOne(Ganja);
exports.deleteGanja = mainController.deleteOne(Ganja);
