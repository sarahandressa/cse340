const invModel = require("../models/inventory-model")
const reviewModel = require("../models/review-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    const classifications = await invModel.getClassifications()
    const classificationSelect = await utilities.buildClassificationList(classifications.rows)
    let messages = req.flash("notice")
    if (!Array.isArray(messages)) {
      messages = messages ? [messages] : []
    }
    res.render("./inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null,
      messages,
      classifications: classifications.rows,
      classificationSelect,
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
    const reviews = await reviewModel.getReviewsByVehiclesId(vehicle_id)
    const account_id = res.locals.accountData?.account_id
    let nav = await utilities.getNav()
    res.render("./inventory/detail", {
      title: data[0].inv_year + " " + data[0].inv_make + " " + data[0].inv_model,
      nav,
      grid,
      reviews,
      account_id,
      inv_id: data[0].inv_id,
      errors: null,
    })
  } catch (error) {
    console.error("Error in buildByVehicleId:", error)
    next(error)
  }
}

/* *************************************
* Submit Review
* *********************************** */
invCont.submitReview = async function (req, res, next) {
  try {
    const { inv_id, account_id, review_text } = req.body
    await reviewModel.addReview(inv_id, account_id, review_text)
    res.redirect(`/inv/detail/${inv_id}`)
  } catch (error) {
    console.error("Error in submitReview", error)
      next(error)
  }
}
   
/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    let messages = req.flash("notice")
    if (!Array.isArray(messages)) messages = messages ? [messages] : []

    res.render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
      messages,
      classification_name: "",  
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
    let classifications = await invModel.getClassifications()
    let classificationList = await utilities.buildClassificationList(classifications)
    let messages = req.flash("notice")
    if (!Array.isArray(messages)) messages = messages ? [messages] : []

    res.render("./inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      errors: null,
      messages,
      classification_name: " ",
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

      const classifications = await invModel.getClassifications()
      const classificationSelect = await utilities.buildClassificationList(classifications.rows)

      res.status(201).render("inventory/management", {
        title: "Vehicle Management",
        nav,
        errors: null,
        messages: req.flash("notice"),
        classifications: classifications.rows,
        classificationSelect
      })
    } else {
        req.flash("notice", "Sorry, the addition failed.")
        const classificationList = await utilities.buildClassificationList(classification_id)
        res.status(501).render("inventory/add-inventory", {
          title: "Add New Vehicle",
          nav,
          classificationList,
          errors: null,
          messages: req.flash("notice"),
          inv_make,
          inv_model,
          inv_description,
          inv_image,
          inv_thumbnail,
          inv_price,
          inv_year,
          inv_miles,
          inv_color,
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
      return res.redirect("/inv")  // 
    } else {
      req.flash("notice", "Sorry, the addition failed.")
      let nav = await utilities.getNav()
      res.status(501).render("./inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: null,
        messages: [], // opcional
        classification_name
      })
    }
  } catch (error) {
    console.error("Error in addClassification:", error)
    next(error)
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Edit Inventory View
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 *  Process Update Inventory
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const { 
    inv_id,
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

  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
)

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash(
      "notice",
      `The vehicle ${inv_make} ${inv_model} was successfully updated.`
    )
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      inv_id,
      ...req.body
    })
  }
}

/* ***************************
 *  Delete Inventory View
 * ************************** */
invCont.deleteInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
  })
}

/* ***************************
 *  Process Delete Inventory
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id)

  const deleteResult = await invModel.deleteInventory(inv_id)

  if (deleteResult) {
    req.flash("notice", 'The vehicle was successfully deleted.')
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the delete failed.")
    res.redirect("/inv/delete/" + inv_id)
  }
}

invCont.triggerError = (req, res, next) => {
  throw new Error("This is a triggered error for testing.");
};

module.exports = invCont