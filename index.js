const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const dotenv = require("dotenv");
const path = require("path");
const axios = require('axios');
const { checkSQLConnection } = require("./src/config/db.mysql");
const { createUsersTable } = require("./src/models/index");
const {info,error} = require('./src/loggers/logger');
const app = express();
app.use(helmet());
app.use(cookieParser());
app.set("view engine", "ejs");

dotenv.config({ path: path.join(__dirname, ".env") });
require("./src/startup/routes")(app);

app.get("/", (req, res) => {
  info('Handling /hello', { foo: 'bar' });
  return res.status(200).send("OK");
});

app.get('/api/users', async (req, res) => {
  //Manual Span

  if(req.query['fail']){
      error('Something went wrong!');
      return res.status(500).send('Error triggered');
  }

  info('Handling the root request', {custom_field:"user-data"})
  let resp = null;
    resp =  await axios.get("https://jsonplaceholder.typicode.com/users");
    res.status(200).send({code:"0", message:"User List", result: resp.data});
 });

const port = process.env.PORT || 3500;

checkSQLConnection()
  .then(async (message) => {
    console.log(message);
    await createUsersTable();
    app.listen(port, () => {
      console.log(`Secure Server listening on port ${port}`);
    });
  })
  .catch((err) => console.log("Database Connection error: ", err.message));
