const { adapterRequest } = require("../helpers/adapterRequest");
const authHelper = require("../helpers/authHelper");
const AppMessages = require("../constants/appMessages");

const {
  successResponse,
  internalServerError,
  genericErrorResponse,
  customSuccessResponse,
  badRequestResponse,
} = require("../helpers/responseHelper");

/**
 * Utility to check null or invalid database responses.
 */
const isValidDbResponse = (response) =>
  response && Object.keys(response).length > 0;

const product = [{
    id:"1",
    name: "Mobile Galaxy S21",
    category: "Mobiles",
    price: "1200"
}]

exports.createProduct= async (req, res) => {
  const httpRequest = adapterRequest(req); // Adapt the request for internal use
  try {
    return successResponse(res, product);
  } catch (error) {
    // Handle any errors and return an internal server error response
    return internalServerError(res);
  }
};


exports.getProducts= async (req, res) => {
  const httpRequest = adapterRequest(req); // Adapt the request for internal use

  try {
    return successResponse(res, product);
  } catch (error) {
    // Handle any errors and return an internal server error response
    return internalServerError(res);
  }
};

exports.getProduct= async (req, res) => {
  const httpRequest = adapterRequest(req); // Adapt the request for internal use

  try {
    return successResponse(res, product[0]);
  } catch (error) {
    // Handle any errors and return an internal server error response
    return internalServerError(res);
  }
};
