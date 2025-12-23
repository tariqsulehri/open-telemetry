'use strict';

const { NodeSDK } = require('@opentelemetry/sdk-node');
const os = require('os'); 
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

// HTTP Exporters
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-http');

const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
const { WinstonInstrumentation } = require('@opentelemetry/instrumentation-winston');
const { resourceFromAttributes } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME, ATTR_HOST_NAME } = require('@opentelemetry/semantic-conventions');

// Enable internal logging for debugging
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// 1. DYNAMIC CONFIGURATION
const collectorUrl = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318';
const serviceName = process.env.OTEL_SERVICE_NAME || 'ecom.nodejs.user.service';

// 2. CONFIGURE EXPORTERS
const traceExporter = new OTLPTraceExporter({
  url: `${collectorUrl}/v1/traces`,
});

const metricExporter = new OTLPMetricExporter({
  url: `${collectorUrl}/v1/metrics`,
});

const logExporter = new OTLPLogExporter({
  url: `${collectorUrl}/v1/logs`,
});

// 3. CONFIGURE SDK
const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
    [ATTR_HOST_NAME]: os.hostname(),
  }),
  traceExporter,
  logExporter,
  // FIXED: Using 'metricReaders' as an array to resolve deprecation
  metricReaders: [
    new PeriodicExportingMetricReader({
      exporter: metricExporter,
      exportIntervalMillis: 10000, 
    })
  ],
  instrumentations: [
    getNodeAutoInstrumentations(), 
    new WinstonInstrumentation({
      logFieldPlaceholder: 'otel', 
      enabled: true,
    })
  ],
});

// 4. START SDK
try {
  sdk.start();
  console.log(`OpenTelemetry initialized for service: ${serviceName}`);
  console.log(`Sending data to: ${collectorUrl}`);
} catch (error) {
  console.error('Error initializing OTEL', error);
}

// Graceful shutdown
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});