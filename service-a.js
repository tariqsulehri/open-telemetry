require('./src/telemetry/instrumentation-l4'); // Load OTEL first
const express = require('express');
const { metrics } = require('@opentelemetry/api'); // Import API

const app = express();

// 1. Initialize the Meter
const meter = metrics.getMeter('shop-metrics');

// 2. Create a Counter
const itemsSoldCounter = meter.createCounter('items_sold', {
  description: 'Count of items sold in the shop'
});

app.get('/buy', (req, res) => {
  // 3. Increment the Counter
  // We add a "label" (attribute) so we can filter by category later
  itemsSoldCounter.add(1, { category: 'electronics' });
  
  console.log("Item sold!");
  res.send('Purchase Complete');
});

app.listen(3000, () => console.log('Shop running on 3000'));