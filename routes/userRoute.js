const express = require("express");
const userRouter = express.Router();
const userController = require("../controllers/userController");
const { userValidate, isAdmin } = require("../middleware/userValidate");
userRouter.post("/register", userController.registerUser);
userRouter.post("/login", userController.login);
userRouter.post("/logout", userValidate, userController.logout);
userRouter.get("/isAuth", userValidate, userController.isAuth);
userRouter.get(
  "/userInformation",
  userValidate,
  userController.userInformation
);
userRouter.post("/cartData", userValidate, userController.cartData);
userRouter.put("/updateCartData", userValidate, userController.updateCartData);

module.exports = userRouter;
