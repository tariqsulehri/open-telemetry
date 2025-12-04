/* service-a.js */
require('./src/telemetry/instrumentation-l5'); // Must be first (Check your path!)

const express = require('express');
const winston = require('winston');
const { metrics } = require('@opentelemetry/api'); // <--- 1. Import Metrics API

// --- SETUP LOGGING ---
const logger = winston.createLogger({
  level: 'info',
  transports: [ new winston.transports.Console() ],
});

// --- SETUP METRICS ---
// 2. Get the Meter
const meter = metrics.getMeter('shop-service-meter');

// 3. Create the Counter
const itemsSoldCounter = meter.createCounter('items_sold', {
  description: 'Count of items sold in the shop'
});

const app = express();

app.get('/buy', (req, res) => {
  // --- A. RECORD METRIC ---
  // 4. Increment the counter (This sends data to Prometheus)
  itemsSoldCounter.add(1, { category: 'electronics' });

  // --- B. RECORD LOG ---
  logger.info('User is buying an item', { 
    item_id: '99', 
    category: 'electronics' 
  });

  res.send('Purchase Complete (Logs + Metrics sent!)');
});

app.listen(3000, () => console.log('Shop running on 3000'));