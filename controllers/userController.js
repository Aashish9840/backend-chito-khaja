const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// token creation
const tokenFunction = (id, role) => {
  const token = jwt.sign({ id, role }, process.env.SECRET_KEY, {
    expiresIn: "2d",
  });
  return token;
};

exports.registerUser = async (req, res) => {
  try {
    const { userName, password, email } = req.body;
    console.log(email, userName, password, "email");
    if (!userName || !password || !email) {
      return res.status(400).json({
        success: false,
        message: "UserName, Email, and Password are required",
      });
    }
    const exist = await userModel.findOne({ email: email });
    if (exist) {
      return res.status(400).json({
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
    return res
      .status(200)
      .json({ success: true, message: "user created successfully" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email or Password are required",
      });
    }

    const user = await userModel.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ message: "User doesnot exists" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password doesnot match" });
    }
    const token = tokenFunction(user._id, user.role);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({ message: "User login Succesfully" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
    });
    return res.status(200).json({ message: "User logout Successfully" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

//user delete
exports.deleteUser = async (req, res) => {
  try {
    const { userId, id, password } = req.body;

    if (!id || !password) {
      return res
        .status(400)
        .json({ message: "User id or Password is missing!" });
    }

    const user = await userModel.findById(id);

    if (!user) {
      return res.status(400).json({ message: "User is not found" });
    }
    if (user.role === "admin") {
      return res.status(400).json({ message: "Admin user can't be deleted" });
    }
    const adminUser = await userModel.findById(userId);

    const isMatch = await bcrypt.compare(password, adminUser.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Password credentials wrong!" });
    }

    await userModel.findByIdAndDelete(id);
    return res.status(200).json({ message: "User Deleted Successfully!" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// admin login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(email, password);
    const user = await userModel.findOne({ email });
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Email Invalid" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = tokenFunction(user._id, user.role);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      maxAge: 2 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ message: "Admin login successful" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// get all the users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find({}).select("-password");
    res.status(200).json({ data: users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// admin or user validate

exports.isAuth = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User is not found" });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(200).json({ message: error.message });
  }
};
