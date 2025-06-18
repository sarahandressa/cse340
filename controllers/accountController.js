const jwt = require("jsonwebtoken")
require("dotenv").config()
const bcrypt = require("bcryptjs")
const accountModel = require("../models/account-model")
const utilities = require("../utilities/")


/* ****************************************
*  Deliver account management view
* *************************************** */
async function buildAccount(req, res, next) {
  let nav = await utilities.getNav()
  let account_firstname = "User"

  try{
    const token = req.cookies.jwt
    if (token) {
        const decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        account_firstname = jwt.decoded.account_firstname
    }
  } catch (err) {
    console.error("JWT decode error:", err)
  }
  
  res.render("account/account-management", {
      title: "Account Management",
      nav,
      errors: null,
      account_firstname
  })
}

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email: "",
    })
}

/* ****************************************
*  Process Login
* *************************************** */
async function accountLogin(req, res) {
    let nav = await utilities.getNav()
    const { account_email, account_password } = req.body
    const accountData = await accountModel.getAccountByEmail(account_email)
    if (!accountData) {
        req.flash("notice", "Please check your credentials and try again.")
        res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,
        })
        return
    }
    try {
        if (await bcrypt.compare(account_password, accountData.account_password)) {
            delete accountData.account_password
            const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
            if (process.env.NODE_ENV === 'development') {
                res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
            }
            return res.redirect("/account/")
        } else {
            req.flash("notice", "Please check your credentials and try again.")
            res.status(400).render("account/login", {
                title: "Login",
                nav,
                errors: null,
                account_email,
            })
        }
    } catch (error) {
        throw new Error('Access Forbidden')
    }
}

/* ****************************************
*  Process Logout
* *************************************** */
async function accountLogout(req, res, next) {
    res.clearCookie("jwt")
    req.flash("notice", "You have been logged out.")
    return res.redirect("/")
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null,
        account_email: ""
    })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body


    let hashedPassword
    try {
        // regular password and cost (salt is auto-generated)
        hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
        req.flash("notice", "Sorry, there was an error processing the registration.")
        res.status(500).render("account/register", {
            title: "Registration",
            nav,
            errors: null,
            account_email: ""
        })
        return;
    }

    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword
    )

    if (regResult) {
        req.flash("notice", `Congratulations, ${account_firstname}, you\'re registered. Please log in.`)
        res.status(201).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email: "",
        })
    } else {
        req.flash("notice", "Sorry, the registration failed.")
        req.status(501).render("account/register", {
            title: "Registration",
            nav,
            errors: null,
            account_email: ""
        })
    }
}

/* ****************************************
*  Deliver account update view
* *************************************** */
async function buildAccountUpdate(req, res, next) {
    let nav = await utilities.getNav()
    const account_id = parseInt(req.params.account_id)
    const accountData = await accountModel.getAccountById(account_id)
    if (!accountData) {
        req.flash("notice", "Account not found.")
        res.redirect("/account/")
        return
    }

    res.render("account/account-update", {
        title: "Edit Account",
        nav,
        errors: null,
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_email: accountData.account_email,
        account_id: accountData.account_id
    })
}

/* ****************************************
*  Process account update
* *************************************** */
async function updateAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_id } = req.body
    const updateResult = await accountModel.updateAccount(account_firstname, account_lastname, account_email, account_id)

    if (updateResult) {
        const updatedAccount = await accountModel.getAccountById(account_id)
        const accessToken = jwt.sign(updatedAccount, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
        
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
        
        req.flash("notice", "Account has been updated successfully.")
        return res.redirect("/account/")
    } else {
        req.flash("notice", "Sorry, the update failed.")
        res.status(501).render("account/account-update", {
            title: "Edit Account",
            nav,
            errors: null,
            account_firstname,
            account_lastname,
            account_email,
            account_id,
        })
    }    
}

/* ****************************************
*  Process password update
* *************************************** */
async function updatePassword(req, res) {
    let nav = await utilities.getNav()
    const { account_password, account_id } = req.body
    
    let hashedPassword
    try {
        // regular password and cost (salt is auto-generated)Add commentMore actions
        hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
         req.flash("notice", "Sorry, there was an error processing the change.")
        res.status(500).render("account/account-update", {
            title: "Edit Account",
            nav,
            errors: null,
            account_id
        })
        return;
    }

    const updateResult = await accountModel.updatePassword(
        hashedPassword,
        account_id
    )

    if (updateResult) {
        req.flash("notice", "Password has been changed successfully.")
        res.redirect("/account/")
    } else {
        req.flash("notice", "Password change failed. Please try again.")
        res.status(501).render("account/account-update", {
            title: "Edit Account",
            nav,
            errors: null,
            account_id
        })
    }

}

module.exports = {
    buildLogin,
    accountLogin,
    accountLogout,
    buildRegister,
    registerAccount,
    buildAccountUpdate,
    updateAccount,
    updatePassword
}