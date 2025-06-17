const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  try {
  let nav = await utilities.getNav()
  let messages = req.flash("notice")
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    errors: null,
    messages,
})  
  } catch (error) {
    console.error("Error in buildManagementView:", error)
    next(error)
  }
}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    if (!data || data.length === 0) {
      let nav = await utilities.getNav()
      return res.status(404).render("./inventory/classification", {
        title: "No vehicles found",
        nav,
        grid: null,
        errors: ["No vehicles found for this classification."],
      })
    }
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
      errors: null,
    }) 
  } catch (error) {
    console.error("Error in buildByClassificationId:", error)
    next(error)
  }
} 

/* ***************************
 *  Build vehicle detail view
 * ************************** */
invCont.buildByVehicleId = async function (req, res, next) {
  try {
    const vehicle_id = req.params.invId
    const data = await invModel.getVehicleById(vehicle_id)
    if (!data || data.length === 0) {
      let nav = await utilities.getNav()
      return res.status(404).render("./inventory/detail", {
        title: "Vehicle not found",
        nav,
        grid: null,
        errors: ["Vehicle not found."],
      })
    }
    const grid = await utilities.buildVehicleDetailView(data[0])
    let nav = await utilities.getNav()
    res.render("./inventory/detail", {
      title: data[0].inv_year + " " + data[0].inv_make + " " + data[0].inv_model,
      nav,
      grid,
      errors: null,
    })
  } catch (error) {
    console.error("Error in buildByVehicleId:", error)
    next(error)
  }
}
   
/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    res.render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
    })
  } catch (error) {
    console.error("Error in buildAddClassification:", error)
    next(error)
  }
}

/* *********************************************
* Build add inventory view
* ******************************************* */
invCont.buildAddInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList()
    res.render("./inventory/add-inventory", {
    title: "Add New Vehicle",
    nav,
    classificationList,
    errors: null,
  })
  } catch (error) {
    console.error("Error in buildAddInventory:", error)
    next(error)
  }
}

/* ***************************
 *  Process Add Inventory
 * ************************** */
invCont.addInventoryItem = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    const { 
      classification_id, 
      inv_make, 
      inv_model, 
      inv_description, 
      inv_image, 
      inv_thumbnail, 
      inv_price, 
      inv_year, 
      inv_miles, 
      inv_color 
    } = req.body

    const invResult = await invModel.addInventoryItem(
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color
    )

    if (invResult) {
      req.flash(
        "notice",
        `The vehicle ${inv_make} ${inv_model} was successfully added.`
      )
      res.status(201).render("inventory/management", {
        title: "Vehicle Management",
        nav,
        errors: null,
      })
    } else {
        req.flash("notice", "Sorry, the addition failed.")
        const classificationList = await utilities.buildClassificationList(classification_id)
        res.status(501).render("inventory/add-inventory", {
          title: "Add New Vehicle",
          nav,
          classificationList,
          errors: null,
          inv_make,
          inv_model,
          inv_description,
          inv_image,
          inv_thumbnail,
          inv_price,
          inv_year,
          inv_miles,
          inv_color
        })
      }
    } catch (error) {
      console.error("Error in addInventoryItem:", error)
      next(error)
    }
  }  

/* ***************************
 *  Process Add Classification
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  try {
    const { classification_name } = req.body
    const regResult = await invModel.addClassification(classification_name)

    if (regResult) {
      req.flash(
        "notice", 
        `The ${classification_name} classification was successfully added.`
      )
      let nav = await utilities.getNav()
      res.status(201).render("./inventory/management", {
        title: "Vehicle Management",
        nav,
        errors: null,
      })
    } else {
      req.flash("notice", "Sorry, the addition failed.")
      let nav = await utilities.getNav()
      res.status(501).render("./inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: null,
    })
  }
} catch (error) {
  console.error("Error in addClassification:", error)
  next(error)
}
}

module.exports = invCont