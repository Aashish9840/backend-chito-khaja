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
      "https://8c06-2407-1400-aa2b-e018-a833-caa6-d16b-96a6.ngrok-free.app/api/payment/esewa/success";
    let failure_url =
      "https://8c06-2407-1400-aa2b-e018-a833-caa6-d16b-96a6.ngrok-free.app/api/payment/esewa/failure";
    let secretKey = "8gBm/:&EnhH.1/q";
    let signature = generateSignature(
      `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`,
      secretKey
    );

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
    res.redirect("http://localhost:3001");
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.failureEsewa = async (req, res) => {
  try {
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
