// Needed Resources
const regValidate = require("../utilities/account-validation")
const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")

/* **************************************
* Account management view
* ************************************ */
// Route to build account management view
router.get("/",
    utilities.checkLogin,
    utilities.handleErrors(accountController.buildAccount)
)

/* **************************************
* Account login and process
* ************************************ */
// Route to build registration view
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Process the login attempt
router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin)
)

/* **************************************
* Account registration and process
* ************************************ */
// Route to build registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Route to register a new user
router.post(
    "/register",
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
)

/* **************************************
* Account update and process
* ************************************ */
// Route to build update account view
router.get("/update/:account_id",
    utilities.checkLogin,
    utilities.handleErrors(accountController.buildAccountUpdate)
)

// Route to process account update
router.post("/update",
    utilities.checkLogin,
    regValidate.updateAccountRules(),
    regValidate.checkAccountData,
    utilities.handleErrors(accountController.updateAccount)
)

// Route to process password change
router.post("/update-password",
    utilities.checkLogin,
    regValidate.passwordRules(),
    regValidate.checkPassword,
    utilities.handleErrors(accountController.updatePassword)
)

/* **************************************
* Account logout
* ************************************ */
// Route to logout
router.get("/logout", utilities.handleErrors(accountController.accountLogout))

module.exports = router;