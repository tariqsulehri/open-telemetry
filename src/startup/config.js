const express = require("express");
const logger = require("morgan");
const cors = require("cors");


const whitelist = ["http://localhost:5173", "http://localhost:3500"];

const corsOptions = {
  // exposedHeaders: "x-auth-token",
  methods: "GET,POST,PUT,DELETE",
  credentials: true,
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

module.exports = function (app) {
  app.use(express.json());
  app.use(cors(corsOptions));
  app.use(
    express.json({
      limit: "20mb",
    })
  );
  app.use(
    express.urlencoded({
      extended: true,
      limit: "20mb",
      parameterLimit: 500000000,
    })
  ); //add limit
  app.use(logger("dev"));
  task.start();
};
