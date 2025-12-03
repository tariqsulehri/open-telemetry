/* service-a.js */
require('./src/telemetry/instrumentation-l5'); // Must be first
const express = require('express');
const winston = require('winston'); // Import standard logger

// 1. Create a Standard Winston Logger
const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console(), // Log to console (human readable)
    // NOTE: The OTEL Instrumentation invisibly adds a 2nd transport here!
  ],
});

const app = express();

app.get('/buy', (req, res) => {
  // 2. Just log normally!
  // OTEL automatically grabs this, adds trace_id, and sends to Loki.
  logger.info('User is buying an item', { 
    item_id: '99', 
    category: 'electronics' 
  });

  // Example Error
  logger.error('Payment gateway warning', { attempt: 1 });

  res.send('Purchase Complete (Logs sent via Winston!)');
});

app.listen(3000, () => console.log('Shop running on 3000'));