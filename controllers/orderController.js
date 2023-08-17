"use strict";
const asyncHandler = require("express-async-handler");
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const { v4: uuidv4 } = require("uuid");
const Order = require("../models/orderModel");

exports.createOrder = asyncHandler(async (req, res) => {
  const { token, cartTotal, currentUser, cartItems } = req.body;

  const customer = await stripe.customers.create({
    email: token.email,
    source: token.id,
  });
  if (!customer) {
    return res.status(400).json({ message: "Failed to create order!" });
  }
  const charge = await stripe.charges.create(
    {
      amount: cartTotal * 1000,
      currency: "EUR",
      customer: customer.id,
      receipt_email: token.email,
    },
    { idempotencyKey: uuidv4() }
  );
  if (!charge) {
    return res.status(400).json({ message: "Payment failed!" });
  }
  const newOrder = await Order.create({
    name: currentUser.user.name,
    email: currentUser.user.email,
    userId: currentUser.user._id,
    orderItems: cartItems,
    orderAmount: cartTotal,
    shippingAddress: {
      street: token.card.address_line1,
      city: token.card.address_city,
      country: token.card.address_country,
      postalCode: token.card.address_zip,
    },
    transactionId: charge.source.id,
  });
  return res.status(200).json({ status: "success", newOrder: newOrder });
});

exports.getUserOrders = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const orders = await Order.find({ userId: userId }).sort({ _id: -1 });
  if (!orders) {
    return res.status(404).json({ message: "Orders not found!" });
  }
  return res.status(200).json(orders);
});
