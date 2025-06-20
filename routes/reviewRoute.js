const express = require("express")
const router = new express.Router()
const reviewController = require("../controllers/invController")
const utilities = require("../utilities")

router.post("/add", utilities.checkLogin, reviewController.submitReview)

module.exports = router