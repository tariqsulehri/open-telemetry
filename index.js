const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const dotenv = require("dotenv");
const path = require("path");
const axios = require('axios');
const { checkSQLConnection } = require("./src/config/db.mysql");
const { createUsersTable } = require("./src/models/index");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const {info,error} = require('./src/loggers/logger');
const { required } = require("joi");
const openTelemetry = require("@opentelemetry/api");

const app = express();
app.use(helmet());
app.use(cookieParser());
app.set("view engine", "ejs");

dotenv.config({ path: path.join(__dirname, ".env") });

// require("./src/telemetry/telemetry");

require("./src/startup/routes")(app);

/**
 * @swagger
 * /example:
 *   get:
 *     summary: Example endpoint
 *     description: Returns a sample response
 *     responses:
 *       200:
 *         description: Success
 */
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Node.js Boilerplate API Documentation",
      version: "1.0.0",
      description: "API documentation for the Node.js Boilerplate",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3500}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [], // Apply the bearer authentication globally if required
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
console.log(
  `Swagger docs available at http://localhost:${process.env.PORT}/api-docs`
);

app.get("/", (req, res) => {
  info('Handling /hello', { foo: 'bar' });
  return res.status(200).send("OK");
});

app.get('/api/hello', (req, res) => {
  info('Handling /hello', { foo: 'bar' });

  const activeSpan = openTelemetry.trace.getSpan(openTelemetry.context.active());

  // create a proper context with the active span
  const ctx = openTelemetry.trace.setSpan(
    openTelemetry.context.active(),
    activeSpan
  );
  // inject trace context into outgoing headers (correct carrier)
  const outgoingHeaders = {
    userid: "001",
    message: "This is my message..."
  };
  openTelemetry.propagation.inject(ctx, outgoingHeaders);
  console.log("Injected Trace Headers:", outgoingHeaders);

  res.send('world');
});

app.get('/api/users', async (req, res) => {
  //Manual Span
  let resp = null;
  openTelemetry.trace.getTracer('manual').startActiveSpan('get users api', async (span)=>{
    resp =  await axios.get("https://jsonplaceholder.typicode.com/users");
    span.end();
    res.send({code:"0", message:"User List", result: resp.data});
  });
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
