require('./src/telemetry/instrumentation-l2'); // Load OTEL first
const express = require('express');
const axios = require('axios'); // You might need to npm install axios
const app = express();

app.get('/buy', async (req, res) => {
  // Service A calls Service B
  try {
    const response = await axios.get('http://localhost:3001/data');
    res.send(`Service A received: ${response.data.result}`);
  } catch (e) {
    res.status(500).send("Error");
  }
});

app.listen(3000, () => console.log('Service A running on 3000'));