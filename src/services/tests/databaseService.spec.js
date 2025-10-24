const { connection } = require("../../config/db.mysql.js");
const { executeQuery } = require("../database/databaseService.js");

jest.mock("../../config/db.mysql.js", () => ({
  connection: {
    query: jest.fn(),
  },
}));

describe("executeQuery", () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  it("should execute a query successfully and return the result", async () => {
    // Mock the connection.query method to return a successful result
    const mockResult = [{ id: 1, name: "Test User" }];
    connection.query.mockResolvedValue([mockResult]);

    const sql = "SELECT * FROM users WHERE id = ?";
    const params = [1];

    const result = await executeQuery(sql, params);

    expect(connection.query).toHaveBeenCalledWith(sql, params); // Ensure the query is called with the correct SQL and params
    expect(result).toEqual(mockResult); // Ensure the result is as expected
  });

  it("should throw an error if the query fails", async () => {
    // Mock the connection.query method to throw an error
    const mockError = new Error("Database Error");
    connection.query.mockRejectedValue(mockError);

    const sql = "SELECT * FROM users WHERE id = ?";
    const params = [1];

    await expect(executeQuery(sql, params)).rejects.toThrow("Database Error"); // Ensure the error is thrown
    expect(connection.query).toHaveBeenCalledWith(sql, params); // Ensure the query is called with the correct SQL and params
  });
});
