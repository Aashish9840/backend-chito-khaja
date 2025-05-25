const foodModel = require("../models/food_model");
const fs = require("fs");
const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");

exports.addFoodItem = async (req, res) => {
  let image_filename = `${req.file.filename}`;
  const { name, description, category, prize } = req.body;
  if (!req.file) {
    return res.status(400).json({ message: "Image file is required" });
  }
  if (!name || !description || !category || !prize) {
    return res
      .status(400)
      .json({ message: "All food information is required" });
  }

  try {
    const food = new foodModel({
      name,
      description,
      image: image_filename,
      category,
      prize,
    });
    await food.save();
    return res.status(200).json({
      success: true,
      message: "New food item is successfully created",
    });
  } catch (error) {
    res.json({ message: error.message });
  }
};

exports.listfood = async (req, res) => {
  try {
    const { category } = req.query;
    if (category) {
      const regex = new RegExp(category, "i");
      const food = await foodModel.find({ category: regex });
      return res.status(200).json({ data: food });
    }
    const food = await foodModel.find({}).sort({ _id: -1 }).limit(30);
    return res.status(200).json({ success: true, data: food });
  } catch (error) {
    res.json({ message: error.message });
  }
};

exports.deleteFoodItem = async (req, res) => {
  const id = req.params.id;
  const { userId, password } = req.body;
  if (!userId) {
    return res.status(400).json({ message: "Admin is allowed to delete food" });
  }

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Food id is required to delete the food.",
    });
  }
  if (!password) {
    return res.status(400).json({ message: "Password is required !" });
  }
  try {
    const user = await userModel.findById(userId);
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Admin password credentials wrong" });
    }
    const food = await foodModel.findById(id);
    if (!food) {
      return res
        .status(400)
        .json({ success: false, message: "Food Item doesnot found" });
    }
    fs.unlink(`uploads/${food.image}`, (err) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
    });
    await food.deleteOne({ id: id });
    return res.json({
      success: true,
      message: "Food item deleted Succcessfully",
    });
  } catch (error) {
    res.json({ message: error.message });
  }
};

exports.updateFoodItem = async (req, res) => {
  try {
    const { id, name, description, category, prize } = req.body;
    const newImage = req.file ? req.file.filename : null;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Id is required for updating the food item",
      });
    }

    const food = await foodModel.findById(id);

    if (!food) {
      return res
        .status(400)
        .json({ success: false, message: "No food Item is found" });
    }

    if (name) food.name = name;
    if (description) food.description = description;
    if (category) food.category = category;
    if (prize) food.prize = prize;

    if (newImage) {
      fs.unlink(`uploads/${food.image}`, () => {});
      food.image = newImage;
    }
    await food.save();
    return res.json({
      success: true,
      message: "Food Details is Updated Successfully",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//get single food item

exports.singleFood = async (req, res) => {
  try {
    const { foodId } = req.body;
    if (!foodId) {
      return res.status(400).json({ message: "Food Id is required" });
    }
    const food = await foodModel.findById(foodId);
    if (!food) {
      return res
        .status(400)
        .json({ message: "Food with such id doesnot exist" });
    }

    return res.status(200).json({ data: food });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// categoryfood
exports.categoryFood = async (req, res) => {
  try {
    const { category } = req.query;
    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }
    const regex = new RegExp(category, "i");
    const data = await foodModel.find({ category: regex });
    return res
      .status(200)
      .json({ data: data, message: "Category food fetched Successfully!" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
