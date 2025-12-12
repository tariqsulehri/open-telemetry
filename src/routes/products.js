const express = require("express");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const router = express.Router();

const productController = require("../controllers/productController");

// --------------------------------------------------
// CRUD + Observability Test Routes
// --------------------------------------------------

// Create Product
router.post(
  "/create-product",
  productController.createProduct
);

// Get All Products
router.get(
  "/get-products",
  productController.getProducts
);

// Get Single Product (Requires Auth + Admin)
router.get(
  "/get-product/:id",
  [auth, admin],
  productController.getProduct
);

// --------------------------------------------------
// ADDITIONAL ROUTES FOR OBSERVABILITY TESTING
// --------------------------------------------------

// 🔹 Artificial Latency Route (for Jaeger Span Testing)
router.get(
  "/test-latency",
  productController.testLatency
);

// // 🔹 Custom Span Example Route
router.get(
  "/test-custom-span",
  productController.testCustomSpan
);

// // 🔹 Search Products by Name (added in controller)
router.get(
  "/search",
  productController.searchProducts
);

// // 🔹 Get Products by Price Range (added in controller)
router.get(
  "/filter-by-price",
  productController.filterByPrice
);

module.exports = router;
