const express = require("express");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const router = express.Router();
const productController = require("../controllers/productController");
const resetTokenAuth = require("../middleware/resetToken");


router.post(
  "/create-product",
  productController.createProduct
);

router.get(
  "/get-products",
  productController.getProducts
);

router.get("/get-product/:id", [auth, admin], productController.getProduct);


module.exports = router;
