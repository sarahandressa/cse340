const invModel = require("../models/inventory-model")
const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

/* ***************************************
* Add Classification Data Validation Rules
* ************************************** */
validate.classificationRules = () => {
    return [
        // classification_name is required, must be string
        body("classification_name")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1})
        .withMessage("Please provide a classification name.") // message sent on error
        .matches(/^[A-Za-z]+$/)
        .withMessage("Classification name can only contain alphabetical characters.") // message sent on error
        .custom(async (classification_name) => {
            const classExists = await invModel.checkExistingClassification(classification_name)
            if (classExists) {
                throw new Error("Classification name already exists.")
            }
        })
    ]

}

/*  **********************************
  *  Add Inventory Data Validation Rules
  * ********************************* */
validate.inventoryRules = () => {
    return [
        // classification_id is required as classficiation_name
        body("classification_id")
        .isInt()
        .withMessage("Please select a classification."), // message sent on error

        // inv_make is required, minimum 3 characters
        body("inv_make")
        .trim()
        .isLength({ min: 3 })
        .withMessage("Please provide a make that is at least 3 characters."), // message sent on error

        // inv_model is required, minimum 3 characters
        body("inv_model")
        .trim()
        .isLength({ min: 3 })
        .withMessage("Please provide a model that is at least 3 characters."), // message sent on error

        // inv_description is required
        body("inv_description")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Please provide a description."), // message sent on error

        // inv_image is required
        body("inv_image")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Please provide an image path."), // message sent on error

        // inv_thumbnail is required
        body("inv_thumbnail")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Please provide a thumbnail path."), // message sent on error

        // inv_price is required, decimal or integers only
        body("inv_price")
        .trim()
        .isFloat({ min: 0 })
        .withMessage("Please provide a valid price."), // message sent on error

        // inv_year is required, 4 digits, integers only
        body("inv_year")
        .trim()
        .isInt({ min: 1900, max: 2024 })
        .withMessage("Please provide a valid year between 1900 and 2024."), // message sent on error

        // inv_miles is required, integers only
        body("inv_miles")
        .trim()
        .isInt({ min: 0 })
        .withMessage("Please provide valid mileage."), // message sent on error

        // inv_color is required
        body("inv_color")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Please provide a color."), // message sent on error
    ]
}

/* ********************************************
* Check data and return errors or continue
* ******************************************* */
validate.checkClassData = async (req, res, next) => {
    const { classification_name } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("inventory/add-classification", {
                errors,
                title: "Add New Classification",
                nav,
                classification_name,       
        })
        return
        }
    next()
}

 /* ******************************
 * Check data and return errors or continue
 * ***************************** */
validate.checkInventoryData =  async (req, res, next) => {
    const { classification_id } =  req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        let classificationList = await utilities.buildClassificationList(classification_id)
        res.render("inventory/add-inventory", {
            errors,
            title: "Add New Vehicle",
            nav,
            classificationList,
            ...req.body,
        })
        return
    }
    next()
}

module.exports = validate