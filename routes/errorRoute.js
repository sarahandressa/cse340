const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")

router.get("/trigger-error", utilities.handleErrors(invController.triggerError));

module.exports = router