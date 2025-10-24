// src/config/tests/mysql.spec.js

const mySql = require("mysql2/promise");
const { checkSQLConnection,connection } = require("../db.mysql"); // Adjust the path as needed


describe('Database Connection', () => {
    beforeAll(async () => {
      // Ensure connection pool is created before tests
      await connection.getConnection();
    });
  
    afterAll(async () => {
      // Close the pool after all tests
      await connection.end();
    });
  
    test('should establish a database connection successfully', async () => {
      const result = await checkSQLConnection();
      expect(result).toBe('Database connection successfull!');
    });
  });


  