const express = require("express");
require("dotenv").config();
const cors = require("cors");
const connectMongo = require("./configuration/mongoDBConnection");
const foodRouter = require("./routes/foodRoutes");

const app = express();

// mongoDB funtion call

connectMongo();
//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//api-end-point
app.use("/api/food", foodRouter);

// access image
app.use("/images", express.static("uploads"));

const Port = process.env.APP_PORT || 4000;
app.listen(Port, () => {
  console.log(`Server is running in localhost:${Port}`);
});
