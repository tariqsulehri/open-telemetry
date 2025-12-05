/* src/telemetry/instrumentation-l5.ts */
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-http');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { SimpleLogRecordProcessor } = require('@opentelemetry/sdk-logs');
const { WinstonInstrumentation } = require('@opentelemetry/instrumentation-winston');
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');

// 1. IMPORT SAMPLERS
const { 
  ParentBasedSampler, 
  TraceIdRatioBasedSampler 
} = require('@opentelemetry/sdk-trace-base');

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const sdk = new NodeSDK({
  serviceName: process.env.SERVICE_NAME || 'l5-service',
  
  // 2. CONFIGURE SAMPLING
  // "root": Use this ratio if there is no parent trace (new request).
  // 0.5 means "Keep 50% of traces". In production, you might use 0.01 (1%).
  sampler: new ParentBasedSampler({
    root: new TraceIdRatioBasedSampler(0.5), 
  }),

  // ... (Keep existing exporters below) ...
  traceExporter: new OTLPTraceExporter({
    url: 'http://127.0.0.1:4318/v1/traces', 
  }),

  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: 'http://127.0.0.1:4318/v1/metrics',
    }),
    exportIntervalMillis: 5000, 
  }),

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
console.log('Level 7: Sampling Enabled (50% Ratio).');