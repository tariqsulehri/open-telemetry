require('./src/telemetry/instrumentation-l2'); // Load OTEL first
const express = require('express');
const app = express();

app.get('/data', (req, res) => {
  // Simulate DB delay
  setTimeout(() => {
    res.json({ result: "Secret Data from B" });
  }, 200);
});

app.listen(3001, () => console.log('Service B running on 3001'));