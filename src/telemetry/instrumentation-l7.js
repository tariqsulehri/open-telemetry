'use strict';

const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

// HTTP Exporters (Correct for Port 4318)
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-http');

const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
const { resourceFromAttributes } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');

// Enable console logging for OTEL internal errors (helps debugging)
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// 1. DYNAMIC CONFIGURATION
// Use the Environment Variable from Docker, default to localhost if running locally without Docker
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
  // Use the service name from Docker Env Var
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
  }),
  traceExporter,
  logExporter,
  // Connect the metric reader to the exporter defined above
  metricReader: new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 10000, // Export metrics every 10 seconds
  }),
  instrumentations: [
    // This automatically loads Express, Http, Pg, Mongo, Redis, etc.
    getNodeAutoInstrumentations(), 
    // REMOVED: new ExpressInstrumentation() (It is already included above)
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

// 'use strict';
// const { NodeSDK } = require('@opentelemetry/sdk-node');
// const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
// const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
// const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
// const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-http');
// const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
// const { resourceFromAttributes } = require('@opentelemetry/resources');
// const { ATTR_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');


// const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');
// const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
// const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');

// diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// const traceExporter = new OTLPTraceExporter({
//   url: (process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318') + '/v1/traces',
// });

// const metricExporter = new OTLPMetricExporter({
//   url: (process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318') + '/v1/metrics',
// });

// const logExporter = new OTLPLogExporter({
//   url: (process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318') + '/v1/logs',
// });

// // ⭐ Prometheus metrics exporter
// const prometheusExporter = new PrometheusExporter({
//   url: 'http://localhost:9464/metrics',
// });

// const sdk = new NodeSDK({
//   resource: resourceFromAttributes({
//     [ATTR_SERVICE_NAME]: 'ecom.nodejs.user.service',
//   }),
//   traceExporter,
//   metricExporter,
//   logExporter,
//   prometheusExporter,
//   instrumentations: [getNodeAutoInstrumentations(), new ExpressInstrumentation(), new HttpInstrumentation() ],
// });

// try {
//   sdk.start();
//   console.log('OpenTelemetry initialized');
// } catch (error) {
//   console.error('Error initializing OTEL', error);
// }
