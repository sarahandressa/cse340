/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/   
require('dotenv').config();
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const session = require("express-session")
const flash = require("connect-flash")
const { cookie } = require("express-validator")
const jwt = require("jsonwebtoken")
const pool = require('./database/')


// Routes & Controllers
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const accountRoute = require("./routes/accountRoute")
const errorRoute = require("./routes/errorRoute")

// Utilities
const utilities = require("./utilities")

/* ***********************************
* Create Express App
*********************************** */
const app = express()

 // Parse cookies first (important!)
app.use(cookieParser());

 app.use(session({
   secret: process.env.SESSION_SECRET,
   resave: true,
   saveUninitialized: true,
   name: "sessionId",
  }));


// Express Messages Middleware
app.use(flash())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

// Parse URL-encoded bodies
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded


// Middleware JWT Global
app.use((req, res, next) => {
  const token = req.cookies.jwt
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
      res.locals.accountData = decoded
    } catch (err) {
      console.log("JWT error:", err)
      res.locals.accountData = null
    }
  } else {
    res.locals.accountData = null
  }
  next ()
})

/* ***********************
 * View Engine and Templates
 *************************/

app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

/* ***********************
 * Routes
 *************************/
app.use(static)
// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))
// Account routes
app.use("/account", accountRoute)
app.use("/register", accountRoute)

// Check JWT
app.use(utilities.checkJWTToken)


// Inventory routes
app.use("/inv", inventoryRoute)
// Error routes
app.use("/error", errorRoute)

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: '404', message: '😱 Sorry, we appear to have lost that page.'})
})

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)

  const message = (err.status == 440) ? err.message :
    "Oh no! There was a crash. Maybe try a different route?"

  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})
  
/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port,() => {
  console.log(`app listening on ${host}:${port}`)
})

