const express = require("express");
require("dotenv").config();
const cors = require("cors");
const cookie_parser = require("cookie-parser");
const connectMongo = require("./configuration/mongoDBConnection");
const foodRouter = require("./routes/foodRoutes");
const userRouter = require("./routes/userRoute");

const app = express();

// mongoDB funtion call

connectMongo();
//middleware
app.use(cookie_parser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//api-end-point for food Model
app.use("/api/food", foodRouter);

// end point for user Model

app.use("/api/user", userRouter);
// access image
app.use("/images", express.static("uploads"));

const Port = process.env.APP_PORT || 4000;
app.listen(Port, () => {
  console.log(`Server is running in localhost:${Port}`);
});
