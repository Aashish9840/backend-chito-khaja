const orderModel = require("../models/orderModel");
const userModel = require("../models/userModel");
const fs = require("fs");
const { pdfDocument } = require("pdf-lib");
const path = require("path");

const PathDir = path.join(__dirname, "../orderPDFFiles");

exports.placeOrder = async (req, res) => {
  try {
    const {
      userId,
      foodItems,
      firstName,
      lastName,
      contact,
      streetAddress,
      country,
      email,
      city,
    } = req.body;

    if (
      !foodItems ||
      !streetAddress ||
      !userId ||
      !contact ||
      !firstName ||
      !lastName ||
      !country ||
      !email ||
      !city
    ) {
      return res
        .status(400)
        .json({ message: "All the order details are required" });
    }

    let amount = 0;
    foodItems.forEach((element) => {
      amount += Number(element.prize) * Number(element.quantity);
    });
    const order = new orderModel({
      userId: userId,
      firstName,
      lastName,
      contact,
      foodItems,
      amount,
      streetAddress,
      city,
      email,
      country,
    });
    const savedOrder = await order.save();
    return res.status(200).json({
      message: "Order is placed Successfully",
      orderId: savedOrder._id,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.userOrder = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(400).json({ message: "No user exists" });
    }

    const data = await orderModel.find({ userId: userId }).select("-email");
    return res.status(200).json({ success: true, data: data });
  } catch (error) {
    return res.status(400).json({ message: message.error });
  }
};

// all order list for admin regarding order

exports.getOrder = async (req, res) => {
  try {
    const data = await orderModel.find({});
    return res.status(200).json({ success: true, data: data });
  } catch (error) {
    return res.status(400).json({ message: message.error });
  }
};

// update Status of order

exports.updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    if (!orderId || !status) {
      return res.status(400).json({ message: "Order ID and Status required" });
    }
    await orderModel.findByIdAndUpdate(orderId, { status: status });
    return res
      .status(200)
      .json({ success: true, message: "Order Status is updated" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const { id, password } = req.body;
    if (!id || !password) {
      return res
        .status(400)
        .json({ message: "Order Id and password is required" });
    }
    const order = await orderModel.findById(id);
    if (!order) {
      return res.status(400).json({ message: "Order with such id not found" });
    }
    await orderModel.findByIdAndDelete(id);
    return res
      .status(200)
      .json({ message: "User Order is deleted Successfully" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
// order reports
exports.orderReport = async (req, res) => {
  try {
    const totalOrder = await orderModel.countDocuments();
    const deliveredOrder = await orderModel.countDocuments({
      status: "delivered",
    });
    const pendingOrder = await orderModel.countDocuments({ status: "pending" });
    const failedOrder = await orderModel.countDocuments({ status: "failed" });

    return res.status(200).json({
      data: [
        {
          Name: "Total Order",
          Total: totalOrder,
        },
        {
          Name: "Pending",
          Total: pendingOrder,
        },
        {
          Name: "Delivered",
          Total: deliveredOrder,
        },
        {
          Name: "Failed",
          Total: failedOrder,
        },
      ],
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// payment update
exports.paymentUpdate = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    if (!orderId || !status) {
      return res.status(400).json({ message: "Order ID and Status required" });
    }
    await orderModel.findByIdAndUpdate(orderId, { payment: status });
    return res
      .status(200)
      .json({ success: true, message: "Order Status is updated" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
