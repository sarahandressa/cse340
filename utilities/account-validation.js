const accountModel = require("../models/account-model")
const utilities = require(".")

const { body, validationResult } = require("express-validator")
const validate = {}

/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
validate.loginRules = () => {
    return [
        // valid email is required and exists in DB
        body("account_email")
            .trim()
            .escape()
            .notEmpty()
            .isEmail()
            .normalizeEmail() // standardization, refer to validor.js for more info
            .withMessage("A valid email is required"), // message sent on error


        //password is required
        body ("account_password")
            .trim()
            .notEmpty()
            .withMessage("Password is required."), //message sent on error    
    ]
}

/* ******************************
 * Check login data and return errors or continue to login
 * ***************************** */

validate.checkLoginData = async (req, res, next) => {
    const { account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/login", {
            errors,
            title: "Login",
            nav,
            account_email,
        })
        return
    }
    next()
}

/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
validate.registrationRules = () => {
    return [
        // firstname is required and must be a string
        body("account_firstname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please provide a first name."), // message sent on error
        
        // lastname is required and must be a string
        body("account_lastname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 2 })
            .withMessage("Please provide a last name."), // message sent on error

        // valid email is required and accont already exist in the DB
        body("account_email")
            .trim()
            .escape()
            .notEmpty()
            .isEmail()
            .normalizeEmail() // standardization, refer to validator.js for more info
            .withMessage("A valid email is required.") // message sent on error
            .custom(async (account_email) => {
                const emailExists = await accountModel.checkExistingEmail(account_email)
                if (emailExists) {
                    throw new Error("Email exists. Please log in or use a different email")
                }
            }),

        // password is required and must be strong
        body("account_password")
            .trim()
            .notEmpty()
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage("Password does not meet requirements."), // message sent on error
    ]
}

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/register", {
            errors,
            title: "Registration",
            nav,
            account_firstname,
            account_lastname,
            account_email,
        })
        return
    }
    next()
}

/* **********************************
* Account Update Data Validation Rules
* ********************************* */
validate.updateAccountRules = () => {
    return [
        // firstname is required and must be a string
        body("account_firstname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please provide a first name."), // message sent on error
        
        // lastname is required and must be a string
        body("account_lastname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 2 })
            .withMessage("Please provide a last name."), // message sent on error

        // valid email is required and accont already exist in the DB
        body("account_email")
            .trim()
            .escape()
            .notEmpty()
            .isEmail()
            .normalizeEmail() // standardization, refer to validator.js for more info
            .withMessage("A valid email is required.") // message sent on error
            .custom(async (account_email, { req }) => {
                const account_id = req.body.account_id
                const emailExists = await accountModel.checkExistingEmail(account_email)
                if (emailExists) {
                    const existingAccount = await accountModel.getAccountByEmail(account_email)
                    if (existingAccount && existingAccount.account_id !== parseInt(account_id)) {
                        throw new Error("Email exists. Please log in or use a different email")
                    }
                }
                return true
            }),
    ]
}


/* **********************************
* Password Update Rules
* ********************************* */
validate.passwordRules = () => {
    return [
        // password is required and must be strong
        body("account_password")
            .trim()
            .notEmpty()
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage("Password does not meet requirements."), // message sent on error
    ]
}

/* **********************************
* Check update account data and return errors or continue to update
* ********************************* */
validate.checkAccountData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email, account_id } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/account-update", {
            errors,
            title: "Edit Account",
            nav,
            account_firstname,
            account_lastname,
            account_email,
            account_id,
        })
        return
    }
    next()
}

/* **********************************
* Check update password data and return errors or continue to update
* ********************************* */
validate.checkPassword = async (req, res, next) => {
    const { account_id } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/account-update", {
            errors,
            title: "Edit Account",
            nav,
            account_id
        })
        return
    }
    next()
}

module.exports = validate
