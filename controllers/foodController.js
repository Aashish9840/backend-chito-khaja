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
    const { id, name, description, category, prize } = req.body;
    const newImage = req.file ? req.file.filename : null;
    if (!id) {
      return res.json({
        success: false,
        message: "Id is required for updating the food item",
      });
    }

    if (name || description || category || prize) {
      const food = await foodModel.findById(id);

      if (!food) {
        return res.json({ success: false, message: "No food Item is found" });
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
    } else {
      return res.json({
        success: false,
        message: "Required food items data to update it",
      });
    }
  } catch (error) {
    res.json({ message: error.message });
  }
};
