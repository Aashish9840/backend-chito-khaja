const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// token creation
const tokenFunction = (id) => {
  const token = jwt.sign({ id }, process.env.SECRET_KEY, {
    expiresIn: "2d",
  });
  return token;
};

exports.registerUser = async (req, res) => {
  try {
    const { userName, password, email } = req.body;
    console.log(email, "email");
    if (!userName || !password || !email) {
      return res.json({
        success: false,
        message: "UserName, Email, and Password are required",
      });
    }

    const exist = await userModel.findOne({ email: email });
    if (exist) {
      return res.json({
        success: false,
        message: "User with the same email is already exists",
      });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = new userModel({
      userName: userName,
      password: hash,
      email: email,
    });
    await user.save();
    return res.json({ success: true, message: "user created successfully" });
  } catch (error) {
    return res.json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
  } catch (error) {
    return res.json({ message: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
  } catch (error) {
    return res.json({ message: error.message });
  }
};
