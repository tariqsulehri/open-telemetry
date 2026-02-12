const express = require("express");
const cors = require("cors");
const users = require("../routes/users");
const products =  require("../routes/products")

/**const whitelist = ["http://localhost:5173", "http://localhost:3500"];

var corsOptions = {
  exposedHeaders: "x-auth-token",
  origin: function (origin, callback) {
    console.log(whitelist.indexOf(origin))
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}*/
module.exports = function (app) {
  //---------------------------------
  app.use(cors());
  /* app.use(cors(corsOptions)); */
  app.use(express.json());
  //----------------------------------
  app.use("/api/user", users);
  //----------------------------------
  app.use("/api/products", products)
};
