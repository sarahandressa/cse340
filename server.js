/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/   
require('dotenv').config()
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const session = require("express-session")
const flash = require("connect-flash")
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
app.use(cookieParser())

/* ***********************
 * Middleware
 ************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 2
  }
}))

// Express Messages Middleware
app.use(flash())
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res)
  next()
})

// Parse URL-encoded bodies
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

/* ***********************
 * Routes - públicas (antes do checkJWTToken)
 *************************/
app.use("/", static)
app.get("/", utilities.handleErrors(baseController.buildHome))
app.get("/account/login", accountRoute)
app.get("/register", accountRoute)
app.post("/account/login", accountRoute)
app.post("/register", accountRoute)

/* ***********************
 * Middleware JWT para rotas protegidas
 *************************/
app.use(utilities.checkJWTToken)

/* ***********************
 * Rotas protegidas (requerem autenticação)
 *************************/
app.use("/account", accountRoute)
app.use("/inv", inventoryRoute)

/* ***********************
 * Error routes
 *************************/
app.use("/error", errorRoute)

/* ***********************
 * File Not Found Route - must be last route in list
 *************************/
app.use(async (req, res, next) => {
  next({ status: '404', message: '😱 Sorry, we appear to have lost that page.' })
})

/* ***********************
* Express Error Handler - after all middleware and routes
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)

  const message = (err.status == 440) ? err.message :
    "Oh no! There was a crash. Maybe try a different route?"

  res.status(err.status || 500).render("errors/error", {
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
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
