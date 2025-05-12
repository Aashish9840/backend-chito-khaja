const express = require("express");
require("dotenv").config();
const cors = require("cors");
const body_parser = require("body-parser");

const app = express();

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors);

//
const Port = process.env.APP_PORT;
app.listen(Port, () => {
  console.log(`Server is running in localhost:${Port}`);
});
