/* instrumentation-l5.ts */
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

// 1. CHANGE IMPORTS TO HTTP
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-http');

const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { SimpleLogRecordProcessor } = require('@opentelemetry/sdk-logs');
const { WinstonInstrumentation } = require('@opentelemetry/instrumentation-winston');
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');

// Enable Debug Logs
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const sdk = new NodeSDK({
  serviceName: process.env.SERVICE_NAME || 'l5-service',
  
  // 2. TRACES (HTTP -> Port 4318 with Path)
  traceExporter: new OTLPTraceExporter({
    url: 'http://127.0.0.1:4318/v1/traces', 
  }),

  // 3. METRICS (HTTP -> Port 4318 with Path)
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: 'http://127.0.0.1:4318/v1/metrics',
    }),
    exportIntervalMillis: 5000, 
  }),

  // 4. LOGS (HTTP -> Port 4318 with Path)
  logRecordProcessor: new SimpleLogRecordProcessor(
    new OTLPLogExporter({
      url: 'http://127.0.0.1:4318/v1/logs',
    })
  ),
  
  instrumentations: [
    getNodeAutoInstrumentations(),
    new WinstonInstrumentation(),
  ],
});

sdk.start();

console.log(' Level 5: Switched to HTTP (Port 4318) for Mac M1 stability.');