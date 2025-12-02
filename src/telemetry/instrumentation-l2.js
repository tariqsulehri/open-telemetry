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
console.log(`OTEL SDK Started for service: ${process.env.SERVICE_NAME}`);