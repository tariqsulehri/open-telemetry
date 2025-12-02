Level 4: Custom Metrics (Prometheus)
-----------------------------------------
The Concept:
Traces tell you how long something took (Latency).

Metrics tell you how much or how many (Aggregates).
Goal: Instead of just tracing /buy, we want to count: "How many items were sold?" and see it on a graph.

Step 1: Add Prometheus to Infrastructure
We need a database to store these numbers.
Create a new file named prometheus.yml in your otel-masterclass folder:

code
Yaml
------------------------------------------
global:
  scrape_interval: 5s # Scrape often for this demo

scrape_configs:
  - job_name: 'otel-collector'
    static_configs:
      - targets: ['otel-collector:8889'] # Prometheus scrapes the Collector

------------------------------------------------

Update docker-compose.yml to include Prometheus:

code
Yaml
-----------------------------------------------
version: '3.8'
services:
  # ... (keep jaeger and otel-collector) ...
  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686"
      - "14250:14250"

  otel-collector:
    image: otel/opentelemetry-collector-contrib:latest
    command: ["--config=/etc/otel-config.yaml"]
    volumes:
      - ./otel-config.yaml:/etc/otel-config.yaml
    ports:
      - "4317:4317" # OTLP gRPC
      - "4318:4318" # OTLP HTTP
      - "8889:8889" # Prometheus Exporter Port (NEW)

  # ADD THIS SECTION
  prometheus:
    image: prom/prometheus:latest
    command: ["--config.file=/etc/prometheus/prometheus.yml"]
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

----------------------------------------------------------
Apply changes:
code
Bash
---------------
docker-compose down
docker-compose up -d
Step 2: Configure the Collector for Metrics

We need to tell the Collector: "Accept metrics via OTLP, and expose them so Prometheus can grab them."
Update otel-config.yaml:

code
Yaml
-----------

receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:
    timeout: 1s

exporters:
  otlp/jaeger:
    endpoint: "jaeger:4317"
    tls:
      insecure: true

  # NEW: Expose metrics for Prometheus to scrape
  prometheus:
    endpoint: "0.0.0.0:8889"

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp/jaeger]
    
    # NEW PIPELINE FOR METRICS
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [prometheus]

Restart the collector: docker-compose restart otel-collector

- Step 3: Instrumentation for Metrics
-------------------------------------------------------
We need to update our code to send metrics and traces.
Install the metrics package:
code
Bash
--------------------------------------------------------------------------------
- npm install @opentelemetry/exporter-metrics-otlp-grpc @opentelemetry/sdk-metrics

Create instrumentation-l4.ts (The "Pro" version):
code
JavaScript
------------------------

const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-grpc');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');

const sdk = new NodeSDK({
  serviceName: process.env.SERVICE_NAME || 'metrics-service',
  
  // TRACING (Keep this)
  traceExporter: new OTLPTraceExporter({
    url: 'http://127.0.0.1:4317',
  }),

  // METRICS (New!)
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: 'http://127.0.0.1:4317', // Sends to same Collector
    }),
    exportIntervalMillis: 5000, // Send metrics every 5 seconds
  }),
  
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
console.log('✅ Level 4: Traces & Metrics enabled.');

- Step 4: Add Business Logic (Counter)
-----------------------------------------
Modify your service-a.js to actually count something.
code
JavaScript
---------------------------------------------
require('./instrumentation-l4'); // Load Level 4
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

Step 5: The Test (Visualizing Data)
---------------------------------------------
Run the App:
code
Bash

export SERVICE_NAME=shop-service && node service-a.js

Generate Data:
Refresh http://localhost:3000/buy about 10 times quickly.
(Wait 10 seconds for the "flush" to happen).

Check Prometheus:
Open http://localhost:9090.
In the search bar, type: items_sold_total.

Click Execute.
Do you see a value (e.g., 10)?
If yes, you have successfully connected Code 
→
→
 Collector 
→
→
 Prometheus! 🚀