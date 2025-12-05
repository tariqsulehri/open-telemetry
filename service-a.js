/* service-a.js */
require('./src/telemetry/instrumentation-l5');
const express = require('express');
const cors = require('cors');
const winston = require('winston');
const { metrics, trace, context } = require('@opentelemetry/api'); // <--- 1. Import Trace API

// --- SETUP LOGGING ---
const logger = winston.createLogger({
  level: 'info',
  transports: [ new winston.transports.Console() ],
});

// --- SETUP METRICS ---
const meter = metrics.getMeter('shop-service-meter');
const itemsSoldCounter = meter.createCounter('items_sold');

const app = express();
app.use(cors());

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.send(await client.register.metrics());
});

app.get('/buy', (req, res) => {
  itemsSoldCounter.add(1, { category: 'electronics' });
  logger.info('User is buying an item', { item_id: '99' });
  res.json({ status: 'Purchase Complete' });
});

// --- NEW CRASH ROUTE ---
app.get('/crash', (req, res) => {
  try {
    // 1. Simulate a bad database call or logic error
    throw new Error("Critical Database Failure: Connection Timeout");
  } catch (e) {
    // 2. Get the current active Span (the one tracking this HTTP request)
    const span = trace.getSpan(context.active());

    if (span) {
      // 3. Attach the Error Stack Trace to the Span
      span.recordException(e);
      
      // 4. Set Status to ERROR (This turns the Jaeger bar RED)
      span.setStatus({ code: 2, message: e.message }); // 2 = ERROR
    }

    // 5. Log it to Loki as well
    logger.error("Request failed", { error: e.message, stack: e.stack });

    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(3000, () => console.log('Shop running on 3000'));