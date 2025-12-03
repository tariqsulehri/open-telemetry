/* instrumentation-l5.ts */
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-grpc');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-grpc');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { SimpleLogRecordProcessor } = require('@opentelemetry/sdk-logs');
const { WinstonInstrumentation } = require('@opentelemetry/instrumentation-winston'); // <--- NEW

const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
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

  // 3. LOGS (Infrastructure)
  logRecordProcessor: new SimpleLogRecordProcessor(
    new OTLPLogExporter({
      url: 'http://127.0.0.1:4317',
    })
  ),
  
  // 4. INSTRUMENTATIONS (The Magic)
  instrumentations: [
    getNodeAutoInstrumentations(), // Express, Http, etc.
    new WinstonInstrumentation(),  // <--- Hooks into Winston automatically
  ],
});

sdk.start();

console.log('Level 5 (Pro): Traces, Metrics, and Winston Logs enabled.');