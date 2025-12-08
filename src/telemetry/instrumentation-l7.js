/* src/telemetry/instrumentation-corrected.js */
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-http');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { SimpleLogRecordProcessor } = require('@opentelemetry/sdk-logs'); // <-- CORRECTED: Removed bad import
const { WinstonInstrumentation } = require('@opentelemetry/instrumentation-winston');
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
const { 
  ParentBasedSampler, 
  TraceIdRatioBasedSampler 
} = require('@opentelemetry/sdk-trace-base');

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// --- WHY: Use the Docker service name for inter-container communication.
const OTLP_ENDPOINT = 'http://otel-collector:4318/v1/'; 

const sdk = new NodeSDK({
  serviceName: process.env.SERVICE_NAME || 'node-express-backend',
  
  // 1. TRACE SAMPLING
  sampler: new ParentBasedSampler({
    root: new TraceIdRatioBasedSampler(0.5), 
  }),

  traceExporter: new OTLPTraceExporter({
    url: OTLP_ENDPOINT + 'traces', // <-- FIXED: Use service name
  }),

  // 2. METRICS (FIXED: Uses plural 'metricReaders' array)
  metricReaders: [ // <-- FIXED: Use plural property
    new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: OTLP_ENDPOINT + 'metrics', // <-- FIXED: Use service name
      }),
      exportIntervalMillis: 5000, 
    }),
  ],

  // 3. LOGS (FIXED: Uses plural 'logRecordProcessors' array and correct class)
  logRecordProcessors: [ // <-- FIXED: Use plural property
    new SimpleLogRecordProcessor( // <-- FIXED: Use correct class
      new OTLPLogExporter({
        url: OTLP_ENDPOINT + 'logs', // <-- FIXED: Use service name
      })
    ),
  ],
  
  instrumentations: [
    getNodeAutoInstrumentations(),
    // We keep this to get trace/span IDs injected into Winston logs (Log Correlation)
    new WinstonInstrumentation({
        disableLogSending: true 
    }),
  ],
});

sdk.start();
console.log('Level 7: Sampling Enabled (50% Ratio).');