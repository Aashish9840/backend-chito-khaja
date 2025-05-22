const orderModel = require("../models/orderModel");
const userModel = require("../models/userModel");

exports.placeOrder = async (req, res) => {
  try {
    const { userId, foodItems, amount, address } = req.body;

    if (!foodItems || !amount || !address || !userId) {
      return res
        .status(400)
        .json({ message: "All the order details are required" });
    }
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "No user is existed" });
    }

    const order = new orderModel({
      userId,
      userName: user.userName,
      email: user.email,
      foodItems,
      amount,
      address,
    });
    await order.save();
    return res.status(200).json({ message: "Order is placed Successfully" });
  } catch (error) {
    return res.status(200).json({ message: error.message });
  }
};

exports.userOrder = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(400).json({ message: "No user exists" });
    }

    const data = await orderModel
      .find({ userId: userId })
      .select("-email -userName");
    return res.status(200).json({ success: true, data: data });
  } catch (error) {
    return res.status(200).json({ message: message.error });
  }
};

// all order list for admin

exports.getOrder = async (req, res) => {
  try {
    const data = await orderModel.find({});
    return res.status(200).json({ success: true, data: data });
  } catch (error) {
    return res.status(200).json({ message: message.error });
  }
};

// update Status of order

exports.updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await orderModel.findByIdAndUpdate(orderId, { status: status });
    return res
      .status(200)
      .json({ success: true, message: "Order Status is updated" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
