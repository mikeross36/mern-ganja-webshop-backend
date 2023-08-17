"use strict";
const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

router.post("/create-order", orderController.createOrder);
router.post("/get-user-orders", orderController.getUserOrders);

module.exports = router;
