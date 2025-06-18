// Needed Resources 
const invValidate = require("../utilities/inventory-validation")
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")

/* **************************************
* Public Routes
* ************************************ */
// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build vehicle detail view
router.get("/detail/:invId", utilities.handleErrors(invController.buildByVehicleId));

/* **************************************
* Protected Routes
* ************************************ */
// Route to build inventory management view
router.get("/",
    utilities.checkJWTToken,
    utilities.checkAdminEmployee,
    utilities.handleErrors(invController.buildManagementView)
)

router.get("/getInventory/:classification_id",
    utilities.checkJWTToken,
    utilities.checkAdminEmployee,
    utilities.handleErrors(invController.getInventoryJSON))

// Route to build add classification view
router.get("/add-classification",
    utilities.checkJWTToken,
    utilities.checkAdminEmployee,
    utilities.handleErrors(invController.buildAddClassification))

// Route to add classification
router.post("/add-classification",
    utilities.checkJWTToken,
    utilities.checkAdminEmployee,
    invValidate.classificationRules(),
    invValidate.checkClassData,
    utilities.handleErrors(invController.addClassification)
)

// Route to build add inventory view
router.get("/add-inventory",
    utilities.checkJWTToken,
    utilities.checkAdminEmployee,
    utilities.handleErrors(invController.buildAddInventory)
)

// Route to add inventory
router.post("/add-inventory",
    utilities.checkJWTToken,
    utilities.checkAdminEmployee,
    invValidate.inventoryRules(),
    invValidate.checkInventoryData,
    utilities.handleErrors(invController.addInventoryItem)
)

// Route to edit inventory view
router.get("/edit/:inv_id",
    utilities.checkJWTToken,
    utilities.checkAdminEmployee,
    utilities.handleErrors(invController.editInventoryView)
)


// Route to update inventory
router.post("/update/",
    utilities.checkJWTToken,
    utilities.checkAdminEmployee,
    invValidate.inventoryRules(),
    invValidate.checkUpdateData,
    utilities.handleErrors(invController.updateInventory)
)

// Route to build delete inventory view
router.get("/delete/:inv_id",
    utilities.checkJWTToken,
    utilities.checkAdminEmployee,
    utilities.handleErrors(invController.deleteInventoryView)
)    

// Route to delete inventory
router.post("/delete/",
    utilities.checkJWTToken,
    utilities.checkAdminEmployee,
    utilities.handleErrors(invController.deleteInventory)
)

module.exports = router;

