const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const dotenv = require("dotenv");
const path = require("path");
const axios = require('axios');
const { checkSQLConnection } = require("./src/config/db.mysql");
const { createUsersTable } = require("./src/models/index");
const {info,error} = require('./src/loggers/logger');
const app = express();
app.use(helmet());
app.use(cookieParser());
app.set("view engine", "ejs");

// CORRECT IMPORT: Use the main api package, not api-metrics
const { metrics, trace } = require('@opentelemetry/api'); 

dotenv.config({ path: path.join(__dirname, ".env") });


require("./src/startup/routes")(app);

// =========================================================
// 1. GLOBAL INSTANTIATION (The "Stick Around" Rule)
// =========================================================

// Get the meter ONCE. 
// Ideally, the name matches your service name or scope.
const meter = metrics.getMeter('payment-service');

// Create Instruments ONCE.
// These are singletons. We will reuse 'paymentCounter' 
// every time a user hits the endpoint.
const paymentCounter = meter.createCounter('payment_transactions', {
  description: 'Counts total payment transactions',
  unit: '1', // The unit of measurement
});

const paymentLatencyHistogram = meter.createHistogram('payment_duration', {
  description: 'Records how long payments take to process',
  unit: 'ms',
});

// =========================================================
// 2. REQUEST HANDLERS
// =========================================================

app.get('/api/checkout', async (req, res) => {
  // Start a timer for the Histogram
  const startTime = Date.now();
  
  // Get the current trace for logging/tagging
  const currentSpan = trace.getActiveSpan();

  // Simulate Business Logic (Random amount)
  const amount = Math.floor(Math.random() * 100);

  // Add metadata to the Trace (not the Metric)
  if (currentSpan) {
    currentSpan.setAttribute('payment.amount', amount);
    currentSpan.setAttribute('payment.currency', 'USD');
  }

  // Simulate processing delay (50ms to 250ms)
  const delay = Math.floor(Math.random() * 200) + 50;
  await new Promise(resolve => setTimeout(resolve, delay));

  // =====================================================
  // 3. RECORD METRICS (Reusing the global instruments)
  // =====================================================
  
  // A. Increment the Counter
  // We pass 'attributes' here to slice/dice data in Grafana later
  paymentCounter.add(1, { 
    status: 'success', 
    currency: 'USD' 
  });

  // B. Record the Duration in Histogram
  const duration = Date.now() - startTime;
  paymentLatencyHistogram.record(duration, {
    status: 'success'
  });

  info('Payment processed', { amount, duration });
  res.json({ status: 'success', amount, duration });
});



app.get("/", (req, res) => {
  info('Handling /hello', { foo: 'bar' });
  return res.status(200).send("OK");
});

app.get('/api/users', async (req, res) => {
  //Manual Span

  if(req.query['fail']){
      error('Something went wrong!');
      return res.status(500).send('Error triggered');
  }

  info('Handling the root request', {custom_field:"user-data"})
  let resp = null;
    resp =  await axios.get("https://jsonplaceholder.typicode.com/users");
    res.status(200).send({code:"0", message:"User List", result: resp.data});
 });

const port = process.env.PORT || 3500;

checkSQLConnection()
  .then(async (message) => {
    console.log(message);
    await createUsersTable();
    app.listen(port, () => {
      console.log(`Secure Server listening on port ${port}`);
    });
  })
  .catch((err) => console.log("Database Connection error: ", err.message));
