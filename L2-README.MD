Level 2: Distributed Tracing (The Relay Race)
--------------------------------------------
Concept: Real apps have multiple services. Context Propagation is how Service B knows it was called by Service A.

1. Setup Infrastructure (Jaeger)
------------------------------------
We need a UI to see the timeline. Create docker-compose.yml:

code
Yaml
--------------------
version: '3.8'
services:
  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686" # The UI
      - "4318:4318"   # OTLP HTTP port


Run: docker-compose up -d


2. Update Dependencies
------------------------------------
We need to talk to Jaeger via HTTP.
code
Bash
npm install @opentelemetry/exporter-trace-otlp-http

3. The Shared Instrumentation (instrumentation-l2.ts)
------------------------------------------------------
We make this dynamic so we can reuse it for two services.

code
JavaScript
-----------------------------------------------------
// instrumentation-l2.ts
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');

const sdk = new NodeSDK({
  serviceName: process.env.SERVICE_NAME || 'unknown-service',
  traceExporter: new OTLPTraceExporter({
    // Point directly to Jaeger
    url: 'http://localhost:4318/v1/traces',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
console.log(`✅ OTEL SDK Started for service: ${process.env.SERVICE_NAME}`);





4. The Two Services
------------------------------------------------------
Service B (The Backend - service-b.js)

code
JavaScript
-----------------------------------------------------
require('./instrumentation-l2'); // Load OTEL first
const express = require('express');
const app = express();

app.get('/data', (req, res) => {
  // Simulate DB delay
  setTimeout(() => {
    res.json({ result: "Secret Data from B" });
  }, 200);
});

app.listen(3001, () => console.log('Service B running on 3001'));


Service A (The Frontend - service-a.js)
-------------------------------------------------
code
JavaScript
-------------------------------------------------
require('./instrumentation-l2'); // Load OTEL first
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


5. Execute & Verify
-------------------------------------------------------------
Terminal 1: export SERVICE_NAME=service-b && node service-b.js
Terminal 2: export SERVICE_NAME=service-a && node service-a.js
Browser: Go to http://localhost:3000/buy.
Jaeger UI (http://localhost:16686): Search for traces.

Teacher's Note: You will see a trace with 2 Spans.
------------------------------------------------------------
Top Bar: service-a (HTTP GET /buy)
Bottom Bar: service-b (HTTP GET /data)
Notice how they are connected? That is Context Propagation working automatically via HTTP headers.