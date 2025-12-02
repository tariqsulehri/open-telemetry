Level 3: The Collector (The Universal Adapter)
---------------------------------------------
Concept: In Level 2, we hardcoded localhost:4318 (Jaeger) into our JavaScript. This is bad practice. If we switch to Datadog or Grafana Tempo, we have to redeploy our code.
Solution: Send data to the OTEL Collector, and let the Collector decide where it goes.

1. Update docker-compose.yml
Add the Collector.
code
Yaml
version: '3.8'
services:
  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686"
      - "14250:14250" # Model protocol for Collector to talk to Jaeger

  otel-collector:
    image: otel/opentelemetry-collector-contrib:latest
    command: ["--config=/etc/otel-config.yaml"]
    volumes:
      - ./otel-config.yaml:/etc/otel-config.yaml
    ports:
      - "4317:4317" # gRPC Receiver
      - "4318:4318" # HTTP Receiver


2. Create Configuration (otel-config.yaml)
------------------------------------------
This tells the collector: "Accept data from App, Process it, Export to Jaeger."

code
Yaml
-------------
receivers:
  otlp:
    protocols:
      http: # Listens on 4318
      grpc: # Listens on 4317

processors:
  batch: # Groups spans to save network
    timeout: 1s

exporters:
  # We export to Jaeger using its native gRPC protocol
  otlp/jaeger:
    endpoint: "jaeger:4317"
    tls:
      insecure: true

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp/jaeger]

3. Update Code (instrumentation-l3.ts)
---------------------------------------
We switch to gRPC (Port 4317) for better performance and point to the Collector.

code
Bash
---------
npm install @opentelemetry/exporter-trace-otlp-grpc

code
JavaScript
// instrumentation-l3.ts
-----------------------------
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc'); // NOTE: gRPC

const sdk = new NodeSDK({
  serviceName: process.env.SERVICE_NAME,
  traceExporter: new OTLPTraceExporter({
    // Pointing to the COLLECTOR (port 4317), not Jaeger directly
    url: 'http://localhost:4317', 
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();


4. Execute
------------------------
docker-compose up -d

Run your services using instrumentation-l3.
Generate traffic.

Check Jaeger. The result looks the same as Level 2, but the Architecture is now Professional.
You have passed Phase 1!
You now have a system that is decoupled, distributed, and instrumented.



Commands
------------------------------------
docker compose up -d --remove-orphans