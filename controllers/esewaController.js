const orderModel = require("../models/orderModel");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
function generateRandomString() {
  return uuidv4();
}

function generateSignature(payload, secretKey) {
  const hmac = crypto.createHmac("sha256", secretKey);
  hmac.update(payload);
  return hmac.digest("base64");
}
exports.getPayment = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    if (!orderId) {
      return res.status(400).json({ message: "Order Id is required" });
    }
    const orderDetails = await orderModel.findById(orderId);
    let order_price = orderDetails.amount;
    let tax_amount = 0;
    let total_amount = order_price;
    let transaction_uuid = generateRandomString();
    let product_code = "EPAYTEST";
    let product_service_charge = 0;
    let product_delivery_charge = 0;
    let success_url =
      "https://b3a7-2403-3800-323c-e09-4446-1181-ad01-490e.ngrok-free.app/api/payment/esewa/success";
    let failure_url =
      "https://b3a7-2403-3800-323c-e09-4446-1181-ad01-490e.ngrok-free.app/api/payment/esewa/failure";
    let secretKey = "8gBm/:&EnhH.1/q";
    let signature = generateSignature(
      `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`,
      secretKey
    );
    orderDetails.transaction_uuid = transaction_uuid;
    await orderDetails.save();
    return res.status(200).json({
      data: {
        amount: order_price,
        tax_amount,
        total_amount,
        transaction_uuid,
        product_code,
        product_service_charge,
        success_url,
        failure_url,
        product_delivery_charge,
        signature,
      },
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.successEsewa = async (req, res) => {
  try {
    let token = req.query.data;
    let queryBody = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    const transaction_id = queryBody.transaction_uuid;
    const order = await orderModel.findOne({
      transaction_uuid: transaction_id,
    });

    order.payment = "success";
    await order.save();

    return res.redirect(`http://localhost:3000/esewa/success/${order._id}`);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.failureEsewa = async (req, res) => {
  try {
    const id = generateRandomString();

    return res.redirect(`http://localhost:3000/esewa/failure/${id}`);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.successInformation = async (req, res) => {
  try {
    const orderId = req.params.id;
    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }
    const order = await orderModel.findById(orderId);

    return res.status(200).json({ data: order });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.failureInformation = async (req, res) => {
  try {
    return res.status(200).json({ message: "Payment failed!" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
