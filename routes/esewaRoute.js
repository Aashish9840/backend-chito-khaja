const express = require("express");
const esewaRouter = express.Router();
const esewaController = require("../controllers/esewaController");

esewaRouter.get("/getPayment", esewaController.getPayment);
esewaRouter.get("/success", esewaController.successEsewa);
esewaRouter.get("/failure", esewaController.failureEsewa);
esewaRouter.get("/successInformation/:id", esewaController.successInformation);

module.exports = esewaRouter;
