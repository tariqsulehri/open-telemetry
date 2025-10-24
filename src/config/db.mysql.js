const mySql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();
const connection = mySql.createPool({
  host: process.env.DB_HOST_NAME,
  user: process.env.DB_USER_NAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: process.env.CONNECTION_TIMEOUT || 3000,
});

/**
 * checkSQLConnection
 * ------------------------------------------------------------
 * This function attempts to establish a connection with the MySQL database using
 * the connection pool. It then pings the database to ensure the connection is active.
 * If successful, it releases the connection back to the pool and returns a success message.
 * If the connection fails, it catches the error and returns an error message with the error details.
 *
 * @async
 * @function
 * @returns {Promise<string>} A message indicating whether the database connection was successful or not.
 *
 * Example usage:
 * const connectionStatus = await checkSQLConnection();
 * console.log(connectionStatus); // "Database connection successful!" or "Database connection failed: <error message>"
 *
 * Note:
 * - Ensure that the MySQL connection pool is properly configured with the environment variables.
 * - Handle the returned messages appropriately in your application to inform the user/admin about the connection status.
 */

const checkSQLConnection = async () => {
  try {
    const conn = await connection.getConnection();
    await conn.ping();
    conn.release();
    return "Database connection successfull!";
  } catch (error) {
    return `Database connection failed: ${error.message}`;
  }
};
module.exports = {
  connection,
  checkSQLConnection,
};
