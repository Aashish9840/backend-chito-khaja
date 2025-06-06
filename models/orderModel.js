const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  firstName: { type: String, required: true },
  foodItems: { type: Array, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: "pending" },
  payment: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending",
  },
  streetAddress: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  date: { type: Date, default: Date.now() },
});

const orderModel =
  mongoose.models.Order || new mongoose.model("Order", orderSchema);
module.exports = orderModel;
