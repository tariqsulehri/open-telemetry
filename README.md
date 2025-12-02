1. Install Required Packages
==================================
1.1. Core SDK + Auto Instrumentation
-----------------------------------

npm install @opentelemetry/sdk-node \
 @opentelemetry/auto-instrumentations-node \
 @opentelemetry/resources \
 @opentelemetry/semantic-conventions


1.2. OTLP Exporters (GRPC or HTTP)
    Use HTTP exporter — easiest and most compatible.
----------------------------------------------------

npm install \
 @opentelemetry/exporter-trace-otlp-http \
 @opentelemetry/exporter-metrics-otlp-http


1.3. Prometheus (through Collector, not directly)
We do not install Prometheus client — OTEL will export metrics → Collector → Prometheus.
---------------------------------------------------------------------------------------
Extra Instrumentations

npm install \
 @opentelemetry/instrumentation-express \
 @opentelemetry/instrumentation-http \
 @opentelemetry/instrumentation-pg \
 @opentelemetry/instrumentation-mongodb




3. Level 2: Connection (Days 3-4)
-----------------------------------
Goal: Connect two services and visualize the timeline.
Concept: Context Propagation.

If Service A calls Service B, how does Service B know it's part of Service A's trace?
Answer: Service A adds a "Header" (HTTP Header) containing the Trace ID. This is called "Passing the Baton."
The Project: "The Shop & The Inventory"
We will stop using the Console (it's too messy). We will send data to Jaeger (a visualization tool).


3.1 Run Two Services
---------------------------
You need two terminals.

3.2 Terminal 1 (The Inventory):
-------------------------------
export SERVICE_NAME=inventory-service && export PORT=3001 && node app.js

3.3 Terminal 2 (The Shop - Calls Inventory):
--------------------------------------------
Modify app.js to call localhost:3001 using http.get.

export SERVICE_NAME=shop-service && export PORT=3000 && node app.js


Teacher's Question: Trigger the Shop service. Open Jaeger (http://localhost:16686).
Do you see one trace with two different colors (services)?
If yes, you have mastered Context Propagation.








COMMANDS
--------------
docker compose up -d --force-recreate

