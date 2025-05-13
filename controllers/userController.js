const userModel = require("../models/userModel");

exports.registerUser = async (req, res) => {
  try {
    const { userName, password, email } = req.body;
    if (!userName || !password || !email) {
      return res.json({
        success: false,
        message: "UserName, Email, and Password are required",
      });
    }
    const user = new userModel({
      userName: userName,
      password: password,
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
