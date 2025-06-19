const express = require("express");
const orderRouter = express.Router();

const orderController = require("../controllers/orderController");
const { userValidate } = require("../middleware/userValidate");

orderRouter.post("/placeOrder", userValidate, orderController.placeOrder);
orderRouter.post("/userOrder", userValidate, orderController.userOrder);
orderRouter.get("/getOrder", orderController.getOrder);
orderRouter.put("/updateStatus", userValidate, orderController.updateStatus);
orderRouter.delete("/delete", orderController.deleteOrder);
orderRouter.get("/orderReport", orderController.orderReport);
orderRouter.put("/paymentUpdate", userValidate, orderController.paymentUpdate);

module.exports = orderRouter;
