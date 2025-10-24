const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const dotenv = require("dotenv");
const path = require("path");
const { checkSQLConnection } = require("./src/config/db.mysql");
const { createUsersTable } = require("./src/models/index");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = express();
app.use(helmet());
app.use(cookieParser());
app.set("view engine", "ejs");

dotenv.config({ path: path.join(__dirname, ".env") });
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
  return res.status(200).send("OK");
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
