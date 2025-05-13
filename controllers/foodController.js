const foodModel = require("../models/food_model");
const fs = require("fs"); // Node.js module to interact with the file system
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
    return res.json({
      success: true,
      message: "New food item is successfully created",
    });
  } catch (error) {
    res.json({ message: error.message });
  }
};

exports.listfood = async (req, res) => {
  try {
    const food = await foodModel.find({});
    return res.json({ success: true, data: food });
  } catch (error) {
    res.json({ message: error.message });
  }
};

exports.deleteFoodItem = async (req, res) => {
  const id = req.params.id;
  console.log("id", id);
  if (!id) {
    return res.json({
      success: false,
      message: "Food id is required to delete the food.",
    });
  }
  try {
    const food = await foodModel.findById(id);

    if (!food) {
      return res.json({ success: false, message: "Food Item doesnot found" });
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
    const { name, description, category, prize } = req.body;

    if (name || !description || !category || !prize) {
    }
  } catch (error) {
    res.json({ message: error.message });
  }
};
