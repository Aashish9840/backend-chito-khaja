const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const foodModel = require("../models/food_model");
require("dotenv").config();
const zod = require("zod");
const { email } = require("zod/v4");
// token creation
const tokenFunction = (id, role) => {
  const token = jwt.sign({ id, role }, process.env.SECRET_KEY, {
    expiresIn: "2d",
  });
  return token;
};

// zod validation
const schema = zod.object({
  userName: zod.string().min(1, { message: "username required" }),
  email: zod
    .string()
    .email({ message: "invalid email" })
    .min(1, { message: "email required" }),
  password: zod
    .string()
    .min(8, { message: "minimum 8 characters required" })
    .min(1, { message: "password required" }),
});
exports.registerUser = async (req, res) => {
  try {
    const validateUser = schema.safeParse(req.body);

    if (!validateUser.success) {
      const errors = {};
      validateUser.error.errors.forEach((error) => {
        errors[error.path[0]] = error.message;
      });
      return res.status(400).json({ error: errors });
    }

    const { email, userName, password } = validateUser.data;
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

// user login
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

    if (user.role !== "user") {
      return res.status(400).json({ message: "Only user are allowed!" });
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
  const { role } = req.body;
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
    });
    return res.status(200).json({ message: `${role} logout Successfully` });
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
      return res
        .status(400)
        .json({ message: "Admingit user can't be deleted" });
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
    const user = await userModel.findOne({ email });
    if (!user || (user.role !== "admin" && user.role !== "staff")) {
      return res
        .status(400)
        .json({ message: "Access denied: Admin and Stafft only allowed" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = tokenFunction(user._id, user.role);
    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      maxAge: 2 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({ message: `${user.role} login successful` });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// get all the users at admin side
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
    if (!userId) {
      return res.status(400).json({ message: "No id found" });
    }
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User is not found" });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(200).json({ message: error.message });
  }
};

// get users details based on id
exports.userInformation = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "No id found" });
    }
    const user = await userModel.findById(userId).select("-password");
    if (!user) {
      return res.status(400).json({ message: "User doesnot exist" });
    }

    return res.status(200).json({ data: user });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.roleUpdate = async (req, res) => {
  try {
    const { updateRole, userId } = req.body;

    if (!updateRole || !userId) {
      return res.status(400).json({ message: "Update role is required" });
    }
    const user = await userModel.findById(userId);
    if (user.role === "admin" || user.role === "user") {
      return res.status(400).json({ message: `${user.role} can't be updated` });
    }
    await userModel.findByIdAndUpdate(userId, { role: updateRole });
    return res.status(200).json({ message: "Role is updated" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

//change password

exports.changePassword = async (req, res) => {
  try {
    const { userId, password, newPassword, confirmPassword } = req.body;
    if (!newPassword || !confirmPassword || !password) {
      return res
        .status(400)
        .json({ message: "All passwords field are required" });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Newpassword and Confirm password must be same" });
    }

    if (password === newPassword) {
      return res.status(400).json({
        message: "Current Password and New password must not be same",
      });
    }
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User is not found!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current Password is wrong" });
    }

    const hashpassword = await bcrypt.hash(newPassword, 15);

    user.password = hashpassword;
    await user.save();
    return res.status(200).json({ message: "Password Updated Successfully!" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Update user details

exports.updateUserDetails = async (req, res) => {
  try {
    const {
      userId,
      userName,
      address,
      country,
      phone,
      date,
      married,
      education,
      gender,
    } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User is not found" });
    }
    await userModel.findByIdAndUpdate(userId, {
      userName,
      address,
      country,
      phone,
      date,
      married,
      education,
      gender,
    });

    return res
      .status(200)
      .json({ message: "Updated Information successfully" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// update cartData
exports.cartData = async (req, res) => {
  try {
    const { userId, foodId, prize, quantity, name, image } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "User not found" });
    }
    if (!foodId || !prize || !quantity || !name) {
      return res.status(400).json({ message: "Food Details are missing!" });
    }
    if (isNaN(quantity) || quantity <= 0 || isNaN(prize) || prize <= 0) {
      return res
        .status(400)
        .json({ message: "Quantity and prize must be positive numbers" });
    }
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const food = user.cardData.find((foodItem) => foodItem.id === foodId);
    if (!food) {
      user.cardData.push({
        id: foodId,
        prize,
        quantity,
        name,
        image,
      });
    } else {
      food.quantity += Number(quantity);
    }
    await user.save();
    return res.status(200).json({ message: "Food added to cart" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// updated cartItems

exports.updateCartData = async (req, res) => {
  try {
    const cartItems = req.body;

    const userId = req.user?.id;

    if (!userId || !Array.isArray(cartItems)) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.cardData = cartItems;
    await user.save();

    return res
      .status(200)
      .json({ message: "Cart updated successfully", data: user.cardData });
  } catch {
    return res.status(400).json({ error: error.message });
  }
};
