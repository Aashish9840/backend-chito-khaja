const express = require("express");
const orderRouter = express.Router();

const orderController = require("../controllers/orderController");
const userValidate = require("../middleware/userValidate");

orderRouter.post("/placeOrder", userValidate, orderController.placeOrder);
orderRouter.post("/getOrder", userValidate, orderController.getOrder);

module.exports = orderRouter;
