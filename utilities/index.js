const jwt = require("jsonwebtoken")
require("dotenv").config()
const invModel = require("../models/inventory-model")

const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += `<li><a href="/inv/type/${row.classification_id}" title="See our inventory of ${row.classification_name} vehicles">${row.classification_name}</a></li>`
  })
  list += "</ul>"
  return list
}

/* **************************************
 * Build the classification view HTML
 ************************************** */
Util.buildClassificationGrid = async function (data) {
  let grid = ""
  if (data.length > 0) {
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => {
      grid += `
        <li>
          <a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
            <img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" />
          </a>
          <div class="namePrice">
            <hr />
            <h2>
              <a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
                ${vehicle.inv_make} ${vehicle.inv_model}
              </a>
            </h2>
            <span>$${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</span>
          </div>
        </li>`
    })
    grid += "</ul>"
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
 * Build the vehicle detail view HTML
 ************************************** */
Util.buildVehicleDetailView = async function (data) {
  if (!data) {
    return '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }

  return `
    <div class="vehicle-detail">
      <img src="${data.inv_image}" alt="${data.inv_make} ${data.inv_model} car">
      <div class="vehicle-info">
        <h2>${data.inv_make} ${data.inv_model} Details</h2>
        <h3 class="vehicle-price">Price: $${new Intl.NumberFormat('en-US').format(data.inv_price)}</h3>
        <p class="vehicle-description"><span class="label">Description:</span> ${data.inv_description}</p>
        <p class="vehicle-miles"><span class="label">Miles:</span> ${new Intl.NumberFormat('en-US').format(data.inv_miles)}</p>
        <p class="vehicle-color"><span class="label">Color:</span> ${data.inv_color}</p>
      </div>
    </div>`
}

/* **************************************
 * Build classification list
 ************************************** */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList = '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += `<option value="${row.classification_id}"${classification_id == row.classification_id ? " selected" : ""}>${row.classification_name}</option>`
  })
  classificationList += "</select>"
  return classificationList
}

/* **************************************
 * Middleware to check JWT token validity
 ************************************** */
Util.checkJWTToken = (req, res, next) => {
  const publicRoutes = ["/", "/account/login", "/register", "/account/register"]

  if (publicRoutes.includes(req.originalUrl)) {
    const token = req.cookies.jwt
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        res.locals.accountData = decoded
        res.locals.loggedin = 1
      } catch {
        res.clearCookie("jwt")
        res.locals.accountData = null
        res.locals.loggedin = 0
      }
    } else {
      res.locals.accountData = null
      res.locals.loggedin = 0
    }
    return next()
  }

  const token = req.cookies.jwt
  if (!token) {
    req.flash("notice", "You must be logged in to access that page.")
    return res.redirect("/account/login")
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      res.clearCookie("jwt")
      req.flash("notice", "Session expired. Please log in again.")
      return res.redirect("/account/login")
    }

    res.locals.accountData = decoded
    res.locals.loggedin = 1
    next()
  })
}

/* ****************************************
 * Middleware For Handling Errors
 **************************************** */
Util.handleErrors = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

/* **************************************
 * Check if user is logged in
 ************************************** */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    res.redirect("/account/login")
  }
}

/* **************************************
 * Check if user is Admin or Employee
 ************************************** */
Util.checkAdminEmployee = (req, res, next) => {
  if (res.locals.loggedin) {
    const accountType = res.locals.accountData.account_type
    if (accountType === "Admin" || accountType === "Employee") {
      next()
    } else {
      req.flash("notice", "Please log in with appropriate account privileges.")
      res.redirect("/account/login")
    }
  } else {
    req.flash("notice", "Please log in.")
    res.redirect("/account/login")
  }
}

module.exports = Util