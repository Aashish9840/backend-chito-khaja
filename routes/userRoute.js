const express = require("express");
const userRouter = express.Router();
const userController = require("../controllers/userController");
const { userValidate, isAdmin } = require("../middleware/userValidate");
userRouter.post("/register", userController.registerUser);
userRouter.post("/login", userController.login);
userRouter.post("/logout", userController.logout);
userRouter.get("/isAuth", userValidate, userController.isAuth);
module.exports = userRouter;
