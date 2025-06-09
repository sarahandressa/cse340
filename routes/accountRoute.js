// Needed ResourcesAdd commentMore actions
const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")

// Route to build account management view view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

module.exports = router;