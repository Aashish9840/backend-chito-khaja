const express = require("express");
const cartRouter = express.Router();
const cartController = require("../controllers/cartController");
const userValidate = require("../middleware/userValidate");

cartRouter.post("/add", userValidate, cartController.addCart);
cartRouter.delete("/remove", userValidate, cartController.removeFromCart);
cartRouter.get("/get", userValidate, cartController.getCartData);

module.exports = cartRouter;
