const express = require("express");
const orderRouter = express.Router();

const orderController = require("../controllers/orderController");
const { userValidate } = require("../middleware/userValidate");

orderRouter.post("/placeOrder", userValidate, orderController.placeOrder);
orderRouter.get("/userOrder", userValidate, orderController.userOrder);
orderRouter.get("/getOrder", orderController.getOrder);
orderRouter.put("/updateStatus", orderController.updateStatus);
orderRouter.delete("/delete", orderController.deleteOrder);
orderRouter.get("/orderReport", orderController.orderReport);

module.exports = orderRouter;
