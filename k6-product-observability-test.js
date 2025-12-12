import http from "k6/http";
import { sleep, check } from "k6";
import { Counter, Gauge, Trend } from "k6/metrics";

// -------------------------
// Custom Metrics
// -------------------------
export let responseTimeTrend = new Trend("response_time_ms");
export let failedRequests = new Counter("failed_requests");
export let activeUsers = new Gauge("active_virtual_users");

// -------------------------
// Test Configuration
// -------------------------
export let options = {
  scenarios: {
    spike_test: {
      executor: "ramping-arrival-rate",
      startRate: 1,
      timeUnit: "1s",
      preAllocatedVUs: 50,
      stages: [
        { target: 50, duration: "10s" },  // spike to 50 RPS
        { target: 50, duration: "20s" },  // hold
        { target: 1, duration: "10s" },   // ramp down
      ],
      exec: "scenarioRequests",
    },
    soak_test: {
      executor: "constant-vus",
      vus: 10,
      duration: "2m",
      exec: "scenarioRequests",
    },
    ramp_test: {
      executor: "ramping-vus",
      startVUs: 1,
      stages: [
        { duration: "30s", target: 20 }, // ramp up
        { duration: "1m", target: 20 },  // hold
        { duration: "30s", target: 1 },  // ramp down
      ],
      exec: "scenarioRequests",
    },
    stress_test: {
      executor: "per-vu-iterations",
      vus: 30,
      iterations: 50,
      maxDuration: "1m",
      exec: "scenarioRequests",
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<1000"],
    failed_requests: ["count<20"],
  },
};

// -------------------------
// BASE URL
// -------------------------
const BASE_URL = "http://localhost:3500/api/products";

// -------------------------
// Random Product ID
// -------------------------
const productIds = [
  "item-001","item-002","item-003","item-004","item-005",
  "item-006","item-007","item-008","item-009","item-010"
];

function getRandomItemId() {
  return productIds[Math.floor(Math.random() * productIds.length)];
}

// -------------------------
// Scenario Function
// -------------------------
export function scenarioRequests() {
  activeUsers.add(__VU);

  // 1. GET ALL PRODUCTS
  let resAll = http.get(`${BASE_URL}/get-products`);
  responseTimeTrend.add(resAll.timings.duration);
  if (!check(resAll, { "GET all products 200": (r) => r.status === 200 })) {
    failedRequests.add(1);
  }
  console.log("Trace-Id (get-products):", resAll.headers["trace-id"]);

  // 2. GET PRODUCT BY ID
  const id = getRandomItemId();
  let resSingle = http.get(`${BASE_URL}/get-product/${id}`, {
    headers: { "x-auth-token": "fake-admin", role: "admin" },
  });
  responseTimeTrend.add(resSingle.timings.duration);
  if (!check(resSingle, { "GET product 200": (r) => r.status === 200 || r.status === 401 })) {
    failedRequests.add(1);
  }
  console.log("Trace-Id (get-product):", resSingle.headers["trace-id"]);

  // 3. Artificial Latency Endpoint
  let resLatency = http.get(`${BASE_URL}/test-latency`);
  responseTimeTrend.add(resLatency.timings.duration);
  if (!check(resLatency, { "Latency endpoint 200": (r) => r.status === 200 })) {
    failedRequests.add(1);
  }
  console.log("Trace-Id (latency):", resLatency.headers["trace-id"]);

  // 4. Custom Span Endpoint
  let resSpan = http.get(`${BASE_URL}/test-custom-span`);
  responseTimeTrend.add(resSpan.timings.duration);
  if (!check(resSpan, { "Custom span 200": (r) => r.status === 200 })) {
    failedRequests.add(1);
  }
  console.log("Trace-Id (custom-span):", resSpan.headers["trace-id"]);

  // 5. Search Endpoint
  let resSearch = http.get(`${BASE_URL}/search?name=tablet`);
  responseTimeTrend.add(resSearch.timings.duration);
  if (!check(resSearch, { "Search 200": (r) => r.status === 200 })) {
    failedRequests.add(1);
  }
  console.log("Trace-Id (search):", resSearch.headers["trace-id"]);

  // 6. Filter by Price Range
  let resFilter = http.get(`${BASE_URL}/filter-by-price?min=100&max=500`);
  responseTimeTrend.add(resFilter.timings.duration);
  if (!check(resFilter, { "Filter price 200": (r) => r.status === 200 })) {
    failedRequests.add(1);
  }
  console.log("Trace-Id (filter-price):", resFilter.headers["trace-id"]);

  // Random sleep to mimic real users
  sleep(Math.random() * 1.5);
}
