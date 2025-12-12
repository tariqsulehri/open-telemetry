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

// OpenTelemetry tracer
const { trace } = require("@opentelemetry/api");
const tracer = trace.getTracer("product-controller");

// PRODUCTS DATA
const products = [
  {
    "id": "item-001",
    "name": "Ultrabook Pro 14",
    "description": "Lightweight 14-inch ultrabook with 16GB RAM and 512GB SSD.",
    "price": 1299.99,
    "image": "https://unsplash.com/photos/black-and-silver-laptop-computer-LRE5ISpxtNY/download?force=true"
  },
  {
    "id": "item-002",
    "name": "Gaming Laptop X15",
    "description": "High-performance 15.6-inch gaming laptop with RTX graphics.",
    "price": 1899.5,
    "image": "https://unsplash.com/photos/t4WDIdZ1C44/download?force=true"
  },
  {
    "id": "item-003",
    "name": "Pro Smartphone S",
    "description": "6.5-inch OLED display smartphone with advanced camera system.",
    "price": 799.0,
    "image": "https://unsplash.com/photos/ZSPBhokqDMc/download?force=true"
  },
  {
    "id": "item-004",
    "name": "NoiseCancel Headphones",
    "description": "Over-ear Bluetooth headphones with active noise cancellation.",
    "price": 199.95,
    "image": "https://unsplash.com/photos/black-headphones--mQ2_QphWjw/download?force=true"
  },
  {
    "id": "item-005",
    "name": "27-inch Monitor 4K",
    "description": "27-inch 4K IPS monitor with HDR support and thin bezels.",
    "price": 429.99,
    "image": "https://unsplash.com/photos/DjUqTwvfBAs/download?force=true"
  },
  {
    "id": "item-006",
    "name": "Mechanical Keyboard K6",
    "description": "Compact mechanical keyboard with RGB backlight and hot-swappable switches.",
    "price": 119.49,
    "image": "https://unsplash.com/photos/UhxVH3zTBfI/download?force=true"
  },
  {
    "id": "item-007",
    "name": "Wireless Mouse M3",
    "description": "Ergonomic wireless mouse with adjustable DPI and long battery life.",
    "price": 49.99,
    "image": "https://unsplash.com/photos/white-and-gray-wireless-computer-mouse-TR6ZNWCsG38/download?force=true"
  },
  {
    "id": "item-008",
    "name": "tablet",
    "description": "10-inch tablet with crisp display, ideal for media and drawing.",
    "price": 329.0,
    "image": "https://unsplash.com/photos/PJno-Fg6vkw/download?force=true"
  },
  {
    "id": "item-009",
    "name": "Wireless Printer 2200",
    "description": "All-in-one wireless printer with fast duplex printing.",
    "price": 159.75,
    "image": "https://unsplash.com/photos/igG4tbqKRx4/download?force=true"
  },
  {
    "id": "item-010",
    "name": "Compact Action Camera",
    "description": "Rugged action camera with 4K recording and waterproof housing.",
    "price": 249.0,
    "image": "https://unsplash.com/photos/OMG1dTk_tiw/download?force=true"
  }
];

/**
 * Artificial delay function (for Jaeger span testing)
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * CREATE PRODUCT
 */
exports.createProduct = async (req, res) => {
  const httpRequest = adapterRequest(req);

  // 🟡 Custom OTel Span
  const span = tracer.startSpan("createProduct-handler");

  try {
    // 🔸 Artificial latency for tracing (Jaeger)
    await delay(300); // 300ms

    span.setAttribute("request.body", JSON.stringify(httpRequest.body));
    
    // Demo response (not writing to DB)
    return successResponse(res, {
      message: "Product created successfully (demo)",
      createdItem: products[0],
    });
  } catch (error) {
    span.recordException(error);
    return internalServerError(res);
  } finally {
    span.end();
  }
};

/**
 * GET ALL PRODUCTS
 */
exports.getProducts = async (req, res) => {
  const httpRequest = adapterRequest(req);
  const span = tracer.startSpan("getProducts-handler");

  try {
    // Artificial latency
    await delay(150);
    
    if(req.query['fail']=='1'){
       throw new Error("Server Failed to Respond...");
    }
    
    span.setAttribute("total.products", products.length);

    return successResponse(res, products);
  } catch (error) {
    span.recordException(error);
    return internalServerError(res);
  } finally {
    span.end();
  }
};

/**
 * GET SINGLE PRODUCT
 */
exports.getProduct = async (req, res) => {
  const httpRequest = adapterRequest(req);
  const span = tracer.startSpan("getProduct-handler");

  try {
    const id = httpRequest.pathParams.id;

    span.setAttribute("product.id.requested", id);

    const product = products.find((p) => p.id === id);

    if (!product) {
      span.setAttribute("product.found", false);
      return badRequestResponse(res, AppMessages.NOT_FOUND("Product"));
    }

    span.setAttribute("product.found", true);

    // Simulate slow lookup for Jaeger visibility
    await delay(200);

    return successResponse(res, product);
  } catch (error) {
    span.recordException(error);
    return internalServerError(res);
  } finally {
    span.end();
  }
};


/**
 * TEST LATENCY ROUTE (For Jaeger Span Testing)
 */
exports.testLatency = async (req, res) => {
  const span = tracer.startSpan("testLatency-handler");
  try {
    const delayMs = Number(req.query.delay || 500);

    span.setAttribute("latency.ms", delayMs);

    await delay(delayMs);

    return successResponse(res, {
      message: `Artificial latency of ${delayMs}ms added`,
    });
  } catch (error) {
    span.recordException(error);
    return internalServerError(res);
  } finally {
    span.end();
  }
};

/**
 * TEST CUSTOM SPAN (Manual OTel Span)
 */
exports.testCustomSpan = async (req, res) => {
  const span = tracer.startSpan("testCustomSpan-handler");

  try {
    span.addEvent("Custom span started");

    await delay(120);

    span.setAttribute("test-span.key", "custom-span-value");

    span.addEvent("Custom span before finish");

    return successResponse(res, {
      message: "Custom span executed successfully",
    });
  } catch (error) {
    span.recordException(error);
    return internalServerError(res);
  } finally {
    span.end();
  }
};

/**
 * SEARCH PRODUCTS BY NAME
 */
exports.searchProducts = async (req, res) => {
  const span = tracer.startSpan("searchProducts-handler");

  try {
    const { name } = req.query;

    span.setAttribute("search.query", name || "");

    if (!name) {
      return badRequestResponse(res, "Search query 'name' is required.");
    }

    const results = products.filter((p) =>
      p.name.toLowerCase().includes(name.toLowerCase())
    );

    span.setAttribute("search.results.count", results.length);

    return successResponse(res, results);
  } catch (error) {
    span.recordException(error);
    return internalServerError(res);
  } finally {
    span.end();
  }
};

/**
 * FILTER PRODUCTS BY PRICE RANGE
 */
exports.filterByPrice = async (req, res) => {
  const span = tracer.startSpan("filterByPrice-handler");

  try {
    const min = parseFloat(req.query.min || "0");
    const max = parseFloat(req.query.max || "99999999");

    span.setAttributes({
      "filter.min": min,
      "filter.max": max,
    });

    const filtered = products.filter(
      (p) => p.price >= min && p.price <= max
    );

    span.setAttribute("filter.results.count", filtered.length);

    return successResponse(res, filtered);
  } catch (error) {
    span.recordException(error);
    return internalServerError(res);
  } finally {
    span.end();
  }
};

