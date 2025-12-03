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
console.log('mLevel 4: Traces & Metrics enabled.');