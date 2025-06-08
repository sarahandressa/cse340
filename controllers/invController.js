const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}



/* ***************************
 *  Build vehicle detail view
 * ************************** */
invCont.buildByVehicleId = async function (req, res, next) {
  const vehicle_id = req.params.invId
  const data = await invModel.getVehicleById(vehicle_id)
  const grid = await utilities.buildVehicleDetailView(data[0])
  let nav = await utilities.getNav()
  res.render("./inventory/detail", {
    title: data[0].inv_year + " " +data[0].inv_make + " " + data[0].inv_model,
    nav,
    grid,
  })
}


/* ***************************
 *  Trigger error route handler
    For testing error handling
 * ************************** */

invCont.triggerError = async function (req, res, next) {
  throw new Error("This is a forced error.")
}

  module.exports = invCont