const express = require("express");
const foodRouter = express.Router();
const multer = require("multer");
const foodController = require("../controllers/foodController");
const { userValidate } = require("../middleware/userValidate");

// file storage
const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    return cb(null, `${Date.now()}${file.originalname}`);
  },
});
const upload = multer({ storage: storage });
foodRouter.post("/add", upload.single("image"), foodController.addFoodItem);
foodRouter.get("/list", foodController.listfood);
foodRouter.delete("/delete/:id", userValidate, foodController.deleteFoodItem);
foodRouter.put(
  "/update",
  upload.single("image"),
  foodController.updateFoodItem
);

module.exports = foodRouter;
