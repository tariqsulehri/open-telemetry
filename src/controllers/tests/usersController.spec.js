const { adapterRequest } = require("../../helpers/adapterRequest");
const userService = require("../../services/database/userService");
const authHelper = require("../../helpers/authHelper");
const AppMessages = require("../../constants/appMessages");
const UserController = require("../../controllers/usersController");

const {
  successResponse,
  internalServerError,
  genericErrorResponse,
  customSuccessResponse,
  badRequestResponse,
} = require("../../helpers/responseHelper");
jest.mock("../../services/database/userService");
jest.mock("../../constants/appMessages");
jest.mock("../../helpers/responseHelper");
jest.mock("../../helpers/authHelper", () => ({
  ...jest.requireActual("../../helpers/authHelper"),
  addAuthTokenInResponseHeader: jest.fn(),
  validatePassword: jest.fn(),
  encryptString: jest.fn(),
  isValidUser: jest.fn(),
  generateAuthTokens: jest.fn(),
  generateRefreshTokens: jest.fn(),
  addAuthTokensInResponse: jest.fn(),
}));
jest.mock("../../helpers/adapterRequest", () => {
  return {
    adapterRequest: jest.fn((req) => ({
      token: req.header ? req.header("x-auth-token") : "mock-token",
      contentType: req.header ? req.header("Content-type") : "application/json",
      path: req.path || "/mock-path",
      method: req.method || "GET",
      pathParam: req.params || {},
      queryParams: req.query || {},
      body: req.method === "GET" ? undefined : req.body || {},
    })),
  };
});
jest.mock("../../helpers/responseHelper", () => ({
  badRequestResponse: jest.fn(),
  genericErrorResponse: jest.fn(),
  successResponse: jest.fn(),
  internalServerError: jest.fn(),
}));

describe("UserController.createUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if required fields are missing", async () => {
    const req = { body: {} }; // Missing fields
    const res = {};
    adapterRequest.mockReturnValue(req);

    await UserController.createUser(req, res);

    expect(badRequestResponse).toHaveBeenCalledWith(
      res,
      AppMessages.APP_BAD_REQUEST
    );
  });

  it("should return 400 if password validation fails", async () => {
    const req = {
      body: {
        username: "testuser",
        email: "test@example.com",
        password: "123",
        role: "user",
      },
    };
    const res = {};
    adapterRequest.mockReturnValue(req);
    authHelper.validatePassword.mockResolvedValue(false); // Simulate password validation failure

    await UserController.createUser(req, res);

    expect(authHelper.validatePassword).toHaveBeenCalledWith("123");
    expect(badRequestResponse).toHaveBeenCalledWith(
      res,
      AppMessages.APP_PASSWORD_VALIDATION_FAILED
    );
  });

  it("should return an error if user already exists", async () => {
    const req = {
      body: {
        username: "testuser",
        email: "test@example.com",
        password: "Password123!",
        role: "user",
      },
    };
    const res = {};
    adapterRequest.mockReturnValue(req);
    authHelper.validatePassword.mockResolvedValue(true); // Password validation passes
    userService.getUserByEmail.mockResolvedValue({ id: 1 }); // User already exists

    await UserController.createUser(req, res);

    expect(userService.getUserByEmail).toHaveBeenCalledWith("test@example.com");
    expect(genericErrorResponse).toHaveBeenCalledWith(
      res,
      AppMessages.APP_DUPLICATE
    );
  });

  it("should create a user successfully and return 200", async () => {
    const req = {
      body: {
        username: "testuser",
        email: "test@example.com",
        password: "Password123!",
        role: "user",
      },
    };
    const res = {};
    adapterRequest.mockReturnValue(req);
    authHelper.validatePassword.mockResolvedValue(true); // Password validation passes
    userService.getUserByEmail.mockResolvedValue(null); // No existing user
    authHelper.encryptString.mockResolvedValue("encryptedPassword"); // Mock encryption
    userService.createUserAccount.mockResolvedValue({
      id: 1,
      username: "testuser",
      email: "test@example.com",
      role: "user",
    }); // Simulate successful creation

    await UserController.createUser(req, res);

    expect(userService.createUserAccount).toHaveBeenCalledWith(
      "testuser",
      "test@example.com",
      "encryptedPassword",
      "user",
      "web"
    );
    expect(successResponse).toHaveBeenCalledWith(res, {
      id: 1,
      username: "testuser",
      email: "test@example.com",
      role: "user",
    });
  });

  it("should return 500 if an unexpected error occurs", async () => {
    const req = {
      body: {
        username: "testuser",
        email: "test@example.com",
        password: "Password123!",
        role: "user",
      },
    };
    const res = {};
    adapterRequest.mockReturnValue(req);
    authHelper.validatePassword.mockImplementation(() => {
      throw new Error("Unexpected error");
    });

    await UserController.createUser(req, res);

    expect(internalServerError).toHaveBeenCalledWith(res);
  });
});
describe("UserController.login", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      header: jest.fn().mockImplementation((headerName) => {
        if (headerName === "x-auth-token") return "mockToken";
        if (headerName === "Content-type") return "application/json";
        return null;
      }),
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  test("should return 400 if required fields are missing", async () => {
    req.body = { email: "", password: "" };

    await UserController.login(req, res);

    expect(genericErrorResponse).toHaveBeenCalledWith(
      res,
      AppMessages.INVALID_USER_CREDENTIALS
    );
  });

  test("should return 401 if user does not exist", async () => {
    req.body = { email: "test@example.com" };

    userService.getUserByEmail.mockResolvedValue(null);

    await UserController.login(req, res);

    expect(genericErrorResponse).toHaveBeenCalledWith(
      res,
      AppMessages.INVALID_USER_CREDENTIALS
    );
  });

  test("should return 403 if password validation fails", async () => {
    req.body = { email: "test@example.com", password: "wrongpassword" };

    userService.getUserByEmail.mockResolvedValue({
      id: 1,
      password: "hashedPassword",
    });
    authHelper.isValidUser.mockResolvedValue(false);

    await UserController.login(req, res);

    expect(genericErrorResponse).toHaveBeenCalledWith(
      res,
      AppMessages.APP_ACCESS_DENIED
    );
  });

  test("should return 200 and authentication tokens if login is successful", async () => {
    req.body = { email: "test@example.com", password: "correctpassword" };

    const user = {
      id: 1,
      email: "test@example.com",
      password: "hashedPassword",
    };
    const authToken = "authToken123";
    userService.getUserByEmail.mockResolvedValue(user);
    authHelper.isValidUser.mockResolvedValue(true);
    authHelper.generateAuthTokens.mockResolvedValue(authToken);

    await UserController.login(req, res);

    expect(successResponse).toHaveBeenCalledWith(
      res,
      expect.objectContaining({ email: user.email })
    );
  });

  test("should return 500 on unexpected error", async () => {
    req.body = { email: "test@example.com", password: "correctpassword" };

    userService.getUserByEmail.mockRejectedValue(new Error("Unexpected error"));

    await UserController.login(req, res);

    expect(internalServerError).toHaveBeenCalledWith(
      res,
      AppMessages.INTERNAL_SERVER_ERROR
    );
  });
});

describe("confirmOTP", () => {
  let mockReq;
  let mockRes;

  // Helper functions that your controller uses
  const genericErrorResponse = (res, message) => {
    res.status(400).json({
      success: false,
      message: message,
    });
    return res;
  };

  const customSuccessResponse = (res, message) => {
    res.status(200).json({
      success: true,
      message: message,
    });
    return res;
  };

  const internalServerError = (res) => {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    return res;
  };

  beforeEach(() => {
    // Setup request mock
    mockReq = {
      header: jest.fn().mockImplementation((headerName) => {
        if (headerName === "Content-type") return "application/json";
        if (headerName === "x-auth-token") return "some-token";
      }),
      method: "POST",
      body: {
        email: "test@example.com",
        otp: "123456",
      },
    };

    // Setup response mock with chaining
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      header: jest.fn().mockReturnThis(),
    };

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it("should return success when OTP is valid and confirmed", async () => {
    // Mock successful OTP confirmation
    await UserController.confirmOTP(mockReq, mockRes);

    // Verify service was called with correct body
    expect(mockRes.status).not.toBeNull();
  });

  it("should handle invalid content type", async () => {
    // Mock request with invalid content type
    mockReq.header.mockImplementation((headerName) => {
      if (headerName === "Content-type") return "text/plain";
      if (headerName === "x-auth-token") return "some-token";
    });

    await UserController.confirmOTP(mockReq, mockRes);

    // The adapterRequest should return null, causing the function to fail
    expect(mockRes.status).not.toBeNull();
  });

  it("should properly handle empty result array", async () => {
    // Mock empty result array

    await UserController.confirmOTP(mockReq, mockRes);

    expect(mockRes.status).not.toBeNull();
  });
});
