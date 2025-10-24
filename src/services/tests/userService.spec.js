const {
  createUserAccount,
  getUsers,
  updateUserPassword,
  deleteUser,
  getUser,
  login,
  getUserByEmail,
  getUserByID,
  getUserAllDataByID,
} = require("../database/userService"); // Adjust the import path as needed
const { executeQuery } = require("../database/databaseService"); // Adjust the import path as needed

jest.mock("../database/databaseService"); // Mock the databaseService dependency

describe("createUserAccount", () => {
  /** 
  const username = 'testuser';
  const email = 'test@example.com';
  const password = 'encryptedPassword';
  const role = 'user';
 */
  afterEach(() => {
    jest.clearAllMocks();
  });
  test("should call executeQuery with correct SQL and params", async () => {
    const username = "testuser";
    const email = "test@example.com";
    const password = "encryptedPassword";
    const role = "user";
    const user_source = "web";

    // Mock the executeQuery function
    executeQuery.mockResolvedValue({ insertId: 1 });
    const result = await createUserAccount(
      username,
      email,
      password,
      role,
      user_source
    );
    expect(executeQuery).toHaveBeenCalledWith(
      expect.stringContaining(
        "INSERT INTO users (username, password, role, email, user_source) VALUES (?, ?, ?, ?, ?)"
      ),
      [username, password, role, email, user_source]
    );
    expect(result).toBe(1);
  });
});

describe("createUserAccount", () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  test("should call executeQuery with correct SQL and params", async () => {
    const username = "testuser";
    const email = "test@example.com";
    const password = "encryptedPassword";
    const role = "user";
    const user_source = "web";

    executeQuery.mockResolvedValue({ insertId: 1 });

    const result = await createUserAccount(
      username,
      email,
      password,
      role,
      user_source
    );

    expect(executeQuery).toHaveBeenCalledWith(
      "INSERT INTO users (username, password, role, email, user_source) VALUES (?, ?, ?, ?, ?)",
      [username, password, role, email, user_source]
    );
    expect(result).toBe(1);
  });

  test("should return null if executeQuery throws an error", async () => {
    const username = "testuser";
    const email = "test@example.com";
    const password = "encryptedPassword";
    const role = "user";

    // Mock executeQuery to throw an error
    executeQuery.mockRejectedValue(new Error("Database error"));

    const result = await createUserAccount(
      username,
      email,
      password,
      role,
      "web"
    );

    expect(result).toBeNull();
    expect(executeQuery).toHaveBeenCalledTimes(1);
  });
});
describe("getUsers", () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  test("should return active users when executeQuery succeeds", async () => {
    // Mock response from executeQuery for active users
    const mockUsers = [
      {
        id: 1,
        username: "user1",
        email: "user1@example.com",
        role_id: 1,
        role: "admin",
      },
      {
        id: 2,
        username: "user2",
        email: "user2@example.com",
        role_id: 2,
        role: "user",
      },
    ];

    executeQuery.mockResolvedValue(mockUsers);

    const result = await getUsers();

    const expectedQuery = `
        SELECT u.id, u.username, u.email, u.role as role_id ,r.rolename as role
        FROM users as u
        INNER JOIN roles as r
        ON r.id = u.role
      `;

    // Normalize the query to avoid issues with spaces and formatting
    const normalizeQuery = (query) => query.replace(/\s+/g, " ").trim();

    expect(normalizeQuery(executeQuery.mock.calls[0][0])).toBe(
      normalizeQuery(expectedQuery)
    );
    expect(result).toEqual(mockUsers); // Expect the returned result to be the list of users
  });

  test("should return null when there are no active users", async () => {
    // Mock response from executeQuery for no active users
    executeQuery.mockResolvedValue([]);

    const result = await getUsers();

    expect(result).toBeNull(); // Expect the result to be null
  });

  test("should return null if executeQuery throws an error", async () => {
    // Mock executeQuery to throw an error
    executeQuery.mockRejectedValue(new Error("Database error"));

    const result = await getUsers();

    expect(result).toBeNull(); // Expect the result to be null
  });
});
describe("updateUserPassword", () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  test("should return true when the password is successfully updated", async () => {
    // Mock response from executeQuery for a successful update
    const mockResponse = { affectedRows: 1 }; // Indicating that one row was affected

    executeQuery.mockResolvedValue(mockResponse);

    const result = await updateUserPassword(1, "newPassword");

    expect(executeQuery).toHaveBeenCalledWith(
      expect.stringMatching(/UPDATE users SET password = \? WHERE id = \?/),
      ["newPassword", 1]
    );
    expect(result).toBe(true); // Expect the result to be true
  });

  test("should return false when no rows are affected", async () => {
    // Mock response from executeQuery indicating no rows were affected
    const mockResponse = { affectedRows: 0 }; // Indicating that no rows were affected

    executeQuery.mockResolvedValue(mockResponse);

    const result = await updateUserPassword(1, "newPassword");

    expect(result).toBe(false); // Expect the result to be false
  });

  test("should return false if executeQuery throws an error", async () => {
    // Mock executeQuery to throw an error
    executeQuery.mockRejectedValue(new Error("Database error"));

    const result = await updateUserPassword(1, "newPassword");

    expect(result).toBe(false); // Expect the result to be false
  });
});

describe("deleteUser", () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  test("should return true when the user is successfully deleted", async () => {
    // Mock response from executeQuery for a successful update
    const mockResponse = { affectedRows: 1 }; // Indicating that one row was affected

    executeQuery.mockResolvedValue(mockResponse);

    const result = await deleteUser(1);

    expect(executeQuery).toHaveBeenCalledWith(
      expect.stringMatching(/UPDATE users SET is_active = 0 WHERE id = \?/),
      [1]
    );
    expect(result).toBe(true); // Expect the result to be true
  });

  test("should return false when no rows are affected", async () => {
    // Mock response from executeQuery indicating no rows were affected
    const mockResponse = { affectedRows: 0 }; // Indicating that no rows were affected

    executeQuery.mockResolvedValue(mockResponse);

    const result = await deleteUser(1);

    expect(result).toBe(false); // Expect the result to be false
  });

  test("should return false if executeQuery throws an error", async () => {
    // Mock executeQuery to throw an error
    executeQuery.mockRejectedValue(new Error("Database error"));

    const result = await deleteUser(1);

    expect(result).toBe(false); // Expect the result to be false
  });
});

describe("getUserByEmail", () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  test("should return the user if a matching email is found", async () => {
    const mockUser = {
      id: 1,
      username: "user1",
      email: "test@example.com",
      password: "hashedPassword",
      role_id: 1,
      role: "admin",
    };

    executeQuery.mockResolvedValue([mockUser]);

    const result = await getUserByEmail("test@example.com");

    // Normalize the queries to remove extra spaces, newlines, and tab characters
    const normalizeQuery = (query) => query.replace(/\s+/g, " ").trim();

    const expectedQuery = `
        SELECT u.id, u.username, u.user_source, u.email, u.password, u.role as role_id, r.rolename as role
        FROM users as u
        INNER JOIN roles as r
        ON r.id = u.role
        WHERE u.email = ? AND u.is_active = 1
      `;

    expect(normalizeQuery(executeQuery.mock.calls[0][0])).toBe(
      normalizeQuery(expectedQuery)
    );
    expect(executeQuery.mock.calls[0][1]).toEqual(["test@example.com"]);
    expect(result).toEqual(mockUser);
  });

  test("should return the user if a matching email is found", async () => {
    const mockUser = {
      id: 1,
      username: "user1",
      email: "test@example.com",
      password: "hashedPassword",
      role_id: 1,
      role: "admin",
    };

    executeQuery.mockResolvedValue([mockUser]);

    const result = await getUserByEmail("test@example.com");

    // Normalize the queries to remove extra spaces, newlines, and tab characters
    const normalizeQuery = (query) => query.replace(/\s+/g, " ").trim();

    const expectedQuery = `
        SELECT u.id, u.username, u.user_source, u.email, u.password, u.role as role_id, r.rolename as role
        FROM users as u
        INNER JOIN roles as r
        ON r.id = u.role
        WHERE u.email = ? AND u.is_active = 1
      `;

    expect(normalizeQuery(executeQuery.mock.calls[0][0])).toBe(
      normalizeQuery(expectedQuery)
    );
    expect(executeQuery.mock.calls[0][1]).toEqual(["test@example.com"]);
    expect(result).toEqual(mockUser);
  });

  test("should return null if executeQuery throws an error", async () => {
    executeQuery.mockRejectedValue(new Error("Database error")); // Mock an error

    const result = await getUserByEmail("test@example.com");
    const expectedQueryRegex =
      /SELECT u\.id,\s*u\.username,\s*u\.user_source,\s*u\.email,\s*u\.password,\s*u\.role as role_id,\s*r\.rolename as role\s*FROM users as u\s*INNER JOIN roles as r\s*ON r\.id =\s*u\.role\s*WHERE u\.email = \?\s*AND u\.is_active = 1/;

    expect(executeQuery).toHaveBeenCalledWith(
      expect.stringMatching(expectedQueryRegex), // Match normalized expected query
      ["test@example.com"]
    );
    expect(result).toBeNull();
  });
});

describe("getUser", () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  test("should return the user if matching email and password are found", async () => {
    const mockUser = {
      id: 1,
      username: "testuser",
      password: "encryptedPassword",
      role: "user",
    };

    executeQuery.mockResolvedValue([mockUser]);
    const result = await getUser("test@example.com", "encryptedPassword");
    const normalizeQuery = (query) => query.replace(/\s+/g, " ").trim();
    const expectedQuery = normalizeQuery(
      "SELECT u.id, u.username, u.email, u.role as role_id, r.rolename as role FROM users as u INNER JOIN roles as r ON r.id = u.role WHERE u.email = ? AND u.password = ? AND u.is_active = 1"
    );
    const actualQuery = normalizeQuery(executeQuery.mock.calls[0][0]);
    expect(actualQuery).toBe(expectedQuery);

    expect(result).toEqual(mockUser);
  });

  test("getUser should return null if no matching user is found", async () => {
    executeQuery.mockResolvedValueOnce([]); // Simulating no user found
    const result = await getUser("notfound@example.com", "wrongPassword");
    const normalizeQuery = (query) => query.replace(/\s+/g, " ").trim();
    const expectedQuery = normalizeQuery(`
      SELECT u.id,
             u.username,
             u.email,
             u.role as role_id,
             r.rolename as role
      FROM users as u
      INNER JOIN roles as r
      ON r.id = u.role
      WHERE u.email = ? 
      AND u.password = ? 
      AND u.is_active = 1
    `);

    const actualQuery = normalizeQuery(executeQuery.mock.calls[0][0]);
    expect(actualQuery).toBe(expectedQuery);
    expect(result).toBeNull();
  });

  test("getUser should return null if executeQuery throws an error", async () => {
    executeQuery.mockRejectedValueOnce(new Error("Database error"));
    const result = await getUser("test@example.com", "encryptedPassword");
    const normalizeQuery = (query) => query.replace(/\s+/g, " ").trim();

    const expectedQuery = normalizeQuery(`
      SELECT u.id,
             u.username,
             u.email,
             u.role as role_id,
             r.rolename as role
      FROM users as u
      INNER JOIN roles as r
      ON r.id = u.role
      WHERE u.email = ? 
      AND u.password = ? 
      AND u.is_active = 1
    `);

    const actualQuery = normalizeQuery(executeQuery.mock.calls[0][0]);
    expect(actualQuery).toBe(expectedQuery);
    expect(result).toBeNull();
  });
});

describe("getUserByID", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("getUserByID should return the user if the ID matches", async () => {
    executeQuery.mockResolvedValueOnce([
      {
        id: 1,
        username: "testuser",
        email: "test@example.com",
        role_id: 1,
        role: "user",
      },
    ]);

    const result = await getUserByID(1);
    const normalizeQuery = (query) => query.replace(/\s+/g, " ").trim();
    const expectedQuery = normalizeQuery(`
      SELECT u.id, u.username, u.email, u.role as role_id, r.rolename as role
      FROM users as u
      INNER JOIN roles as r
      ON r.id = u.role
      WHERE u.id = ? 
      AND u.is_active = 1
    `);

    const actualQuery = normalizeQuery(executeQuery.mock.calls[0][0]);
    expect(actualQuery).toBe(expectedQuery);
    expect(result).toEqual({
      id: 1,
      username: "testuser",
      email: "test@example.com",
      role_id: 1,
      role: "user",
    });
  });

  test("getUserByID should return null if no user is found with the given ID", async () => {
    // Mock the executeQuery to return an empty result
    executeQuery.mockResolvedValueOnce([]);  // No user found for ID 999
  
    const result = await getUserByID(999); // Use a non-existent ID
  
    const normalizeQuery = (query) => query.replace(/\s+/g, ' ').trim();
  
    // Adjust the expected query to match the actual query being executed
    const expectedQuery = normalizeQuery(`
      SELECT u.id,
             u.username,
             u.email,
             u.role as role_id,
             r.rolename as role
      FROM users as u
      INNER JOIN roles as r
      ON r.id = u.role
      WHERE u.id = ? 
      AND u.is_active = 1
    `);
  
    // Normalize the actual query
    const actualQuery = normalizeQuery(executeQuery.mock.calls[0][0]);
  
    // Compare the normalized query
    expect(actualQuery).toBe(expectedQuery);
    
    // Test the result to ensure it's null when no user is found
    expect(result).toBeNull();
  });
  

  test("should return null if executeQuery throws an error", async () => {
    executeQuery.mockRejectedValue(new Error("Database error")); // Mock an error

    const result = await getUserByID(1);

    expect(executeQuery).toHaveBeenCalledWith(
      expect.stringMatching(
        /SELECT\s+u\.id,\s+u\.username,\s+u\.email,\s+u\.role\s+as\s+role_id,\s+r\.rolename\s+as\s+role\s+FROM\s+users\s+as\s+u\s+INNER\s+JOIN\s+roles\s+as\s+r\s+ON\s+r\.id\s+=\s+u\.role\s+WHERE\s+u\.id\s+=\s+\?\s+AND\s+u\.is_active\s+=\s+1/
      ),
      [1]
    );
    
    expect(result).toBeNull(); // Expect result to be null if there's an error
  });
});

describe("getUserAllDataByID", () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  test("should return the user data if the ID matches", async () => {
    const mockUser = {
      id: 1,
      username: "testuser",
      email: "test@example.com",
      role: "user",
      password: "encryptedPassword", // Include password for testing
    };

    // Mock the executeQuery function to return a user when called
    executeQuery.mockResolvedValue([mockUser]); // Return an array containing the mock user

    const result = await getUserAllDataByID(1);

    expect(executeQuery).toHaveBeenCalledWith(
      expect.stringMatching(
        /SELECT\s+u\.id,\s+u\.username,\s+u\.email,\s+u\.password,\s+u\.role\s+as\s+role_id,\s+r\.rolename\s+as\s+role\s+FROM\s+users\s+as\s+u\s+INNER\s+JOIN\s+roles\s+as\s+r\s+WHERE\s+u\.id\s+=\s+\?\s+AND\s+u\.is_active\s+=\s+1/
      ),
      [1]
    );
    
    expect(result).toEqual(mockUser); // Check that the result matches the mock user
  });

  test("should return null if no user is found with the given ID", async () => {
    executeQuery.mockResolvedValue([]); // Mock to return an empty array

    const result = await getUserAllDataByID(999); // Use a non-existent ID
    expect(executeQuery).toHaveBeenCalledWith(
      expect.stringMatching(
        /SELECT\s+u\.id,\s+u\.username,\s+u\.email,\s+u\.password,\s+u\.role\s+as\s+role_id,\s+r\.rolename\s+as\s+role\s+FROM\s+users\s+as\s+u\s+INNER\s+JOIN\s+roles\s+as\s+r\s+WHERE\s+u\.id\s+=\s+\?\s+AND\s+u\.is_active\s+=\s+1/
      ),
      [999]
    );    
    expect(result).toBeNull(); // Expect result to be null when no user is found
  });

  test("should return null if executeQuery throws an error", async () => {
    executeQuery.mockRejectedValue(new Error("Database error")); // Mock an error
    const result = await getUserAllDataByID(1);
    expect(executeQuery).toHaveBeenCalledWith(
      expect.stringMatching(
        /SELECT\s+u\.id,\s+u\.username,\s+u\.email,\s+u\.password,\s+u\.role\s+as\s+role_id,\s+r\.rolename\s+as\s+role\s+FROM\s+users\s+as\s+u\s+INNER\s+JOIN\s+roles\s+as\s+r\s+WHERE\s+u\.id\s+=\s+\?\s+AND\s+u\.is_active\s+=\s+1/
      ),
      [1]
    );
    
    expect(result).toBeNull(); // Expect result to be null if there's an error
  });
});

describe("User Login Tests", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test("should return user when valid credentials are provided", async () => {
    // Mock user data
    const mockUser = {
      id: 1,
      username: "testuser",
      email: "test@example.com",
      role: "user",
    };

    // Mock executeQuery to return the expected user
    executeQuery.mockResolvedValueOnce([mockUser]);

    const email = "test@example.com";
    const password = "securePassword";

    const result = await login(email, password);

    // Verify executeQuery was called with correct SQL and parameters
    expect(executeQuery).toHaveBeenCalledWith(
      expect.stringContaining("SELECT"),
      [email, password]
    );

    expect(result).toEqual(mockUser);
  });

  test("should return null when no user is found", async () => {
    // Mock executeQuery to return empty array (no user found)
    executeQuery.mockResolvedValueOnce([]);

    const email = "nonexistent@example.com";
    const password = "wrongPassword";

    const result = await login(email, password);

    // Verify executeQuery was called with correct parameters
    expect(executeQuery).toHaveBeenCalledWith(
      expect.stringContaining("SELECT"),
      [email, password]
    );

    expect(result).toBeNull();
  });

  test("should return null when database query fails", async () => {
    // Mock executeQuery to throw an error
    executeQuery.mockRejectedValueOnce(new Error("Database error"));

    const email = "test@example.com";
    const password = "securePassword";

    const result = await login(email, password);

    // Verify executeQuery was called with correct parameters
    expect(executeQuery).toHaveBeenCalledWith(
      expect.stringContaining("SELECT"),
      [email, password]
    );

    expect(result).toBeNull();
  });

  test("should handle empty email or password", async () => {
    const result1 = await login("", "password");
    const result2 = await login("email@test.com", "");
    const result3 = await login("", "");

    expect(result1).toBeNull();
    expect(result2).toBeNull();
    expect(result3).toBeNull();
  });
});
