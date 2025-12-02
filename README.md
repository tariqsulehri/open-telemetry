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


COMMANDS
--------------
docker compose up -d --force-recreate

