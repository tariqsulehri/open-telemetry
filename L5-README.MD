
- Now we tackle the Third Pillar: Logs.
----------------------------------------
  And crucially, we are going to bring Grafana into the mix. Why? Because looking at Jaeger for traces and Prometheus for metrics separately is annoying. Grafana brings them all into one "Single Pane of Glass."

- Level 5: The Unified View (Logs, Loki & Grafana)
--------------------------------------------------
  - The Concept: Old Way: console.log -> View in Terminal. Hard to search, disappears on restart.
  - Pro Way: App -> Collector -> Loki (Database for Logs).
  - The Goal: You see a spike in Error Metrics (Prometheus), you click it, it takes you to the Trace (Jaeger/Tempo), and the Trace shows you the exact Log Message (Loki).

- Step 1: Infrastructure Upgrade (The Big One)


We need to add Loki (Log Store) and Grafana (UI) to your stack.

  - Update docker-compose.yml
  - Add these three services (loki, grafana, and tempo) to your existing file.
  - Note: We are swapping Jaeger for Tempo here because Tempo works better inside Grafana, but if you prefer keeping Jaeger, you can, but let's stick to the "LGTM" stack.
          (Actually, to keep it simple and not break what you have, let's keep Jaeger for now and just add Loki + Grafana).

Add this to the bottom of your services: list:
code Yaml
----------------------------------------------
# 1. Loki (Log Database)
  loki:
    image: grafana/loki:3.0.0
    command: -config.file=/etc/loki/local-config.yaml
    ports:
      - "3100:3100"

  # 2. Grafana (The Dashboard)
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000" # Mapped to port 3001 to avoid conflict if you have something on 3000
    environment:
      - GF_AUTH_ANONYMOUS_ENABLED=true
      - GF_AUTH_ANONYMOUS_ORG_ROLE=Admin
      - GF_AUTH_DISABLE_LOGIN_FORM=true
    volumes:
      # We will create this file in a moment to auto-connect Prometheus and Loki
      - ./grafana-datasources.yaml:/etc/grafana/provisioning/datasources/datasources.yaml

- Step 2: Auto-Configure Grafana
----------------------------------------
Instead of manually clicking "Add Datasource" inside Grafana, we will configure it with code.
Create a file named grafana-datasources.yaml:

code Yaml
------------------
apiVersion: 1

datasources:
  # Connect to Prometheus (Metrics)
  - name: Prometheus
    type: prometheus
    uid: prometheus
    url: http://prometheus:9090
    access: proxy
    isDefault: true

  # Connect to Loki (Logs)
  - name: Loki
    type: loki
    uid: loki
    url: http://loki:3100
    access: proxy

  # Connect to Jaeger (Traces) - via the Jaeger Query API
  - name: Jaeger
    type: jaeger
    uid: jaeger
    url: http://jaeger:16686
    access: proxy


Step 3: Configure Collector to handle Logs
------------------------------------------
We need to tell the Collector: "If you receive Logs, send them to Loki."
- Update otel-config.yaml:
  Code Yaml
--------------------------
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
  
  # NEW: Resource processor to create labels for Loki
  resource:
    attributes:
      - action: insert
        key: loki.resource.labels
        value: service_name

exporters:
  otlp/jaeger:
    endpoint: "jaeger:4317"
    tls:
      insecure: true

  prometheus:
    endpoint: "0.0.0.0:8889"

  # NEW: Export logs to Loki
  loki:
    endpoint: "http://loki:3100/loki/api/v1/push"

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp/jaeger]
    
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [prometheus]

    # NEW PIPELINE FOR LOGS
    logs:
      receivers: [otlp]
      processors: [batch, resource] # resource processor is needed for Loki labels
      exporters: [loki]


- Restart Infrastructure:
Code Bash
---------------------
  - docker-compose down
  - docker-compose up -d
  
  - Wait 30 seconds for Grafana/Loki to start.

- Step 4: Instrumentation for Logs (Node.js)
-------------------------------------------
This is the modern "Pro" part. We won't use console.log. We will use the OTEL Log SDK to send logs directly to the collector.

Install Log Packages:
Code Bash
--------------------
- npm install @opentelemetry/sdk-logs @opentelemetry/exporter-logs-otlp-grpc

- Create instrumentation-l5.ts:
------------------------------------
This combines Traces, Metrics, and Logs.

Code JavaScript
/* instrumentation-l5.ts */
---------------------------------------

const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-grpc');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-grpc'); // NEW
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { SimpleLogRecordProcessor } = require('@opentelemetry/sdk-logs'); // NEW
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');

// Enable Debugging
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const sdk = new NodeSDK({
  serviceName: process.env.SERVICE_NAME || 'l5-service',
  
  // 1. TRACES
  traceExporter: new OTLPTraceExporter({
    url: 'http://127.0.0.1:4317',
  }),

  // 2. METRICS
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: 'http://127.0.0.1:4317',
    }),
    exportIntervalMillis: 5000, 
  }),

  // 3. LOGS (The New Part)
  logRecordProcessor: new SimpleLogRecordProcessor(
    new OTLPLogExporter({
      url: 'http://127.0.0.1:4317', // Sends logs to the same collector
    })
  ),
  
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
console.log('✅ Level 5: Traces, Metrics, AND Logs enabled.');
--------------------------------------------------

Update service-a.js to emit Logs:
Instead of console.log, we use the OTEL API to emit logs that are attached to the trace.
code
JavaScript
/* service-a.js */
require('./instrumentation-l5');
const express = require('express');
const { logs, trace } = require('@opentelemetry/api'); // Import logs API

const app = express();
const logger = logs.getLogger('my-logger'); // Get an OTEL logger

app.get('/buy', (req, res) => {
  // Emit a structured log
  logger.emit({
    body: "User clicked buy button",
    severityNumber: 9, // INFO
    severityText: "INFO",
    attributes: {
      'user.action': 'buy',
      'item.id': '99'
    }
  });

  // Emit an error log example
  logger.emit({
    body: "Payment processed successfully",
    severityNumber: 10, // INFO
    severityText: "INFO"
  });

  res.send('Purchase Complete (Check Grafana!)');
});

app.listen(3000, () => console.log('Shop running on 3000'));

Step 5: The Grand Test
--------------------------------
Run the App:
code
Bash

export SERVICE_NAME=shop-service && node service-a.js

Generate Traffic:
Hit http://localhost:3000/buy a few times.

Open Grafana:
Go to http://localhost:3001.

Explore -> Loki:
In the query editor, type {service_name="shop-service"} and hit Run query.
Do you see "User clicked buy button"?

The "Magic" Link:
If you expand the log line in Grafana, you should see a traceid.
Because we set up the datasources, Grafana might even show you a "Split" button to view the Trace side-by-side with the Log.

Let me know if you see the logs in Grafana! (This is often the hardest part due to config, so don't worry if we need to tweak the otel-config).