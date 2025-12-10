'use strict';

const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-http');
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
const { resourceFromAttributes } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');


diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const traceExporter = new OTLPTraceExporter({
  url: (process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318') + '/v1/traces',
});

const metricExporter = new OTLPMetricExporter({
  url: (process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318') + '/v1/metrics',
});

const logExporter = new OTLPLogExporter({
  url: (process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318') + '/v1/logs',
});

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'node-express-backend',
  }),
  traceExporter,
  metricExporter,
  logExporter,
  instrumentations: [getNodeAutoInstrumentations()],
});

try {
  sdk.start();
  console.log('OpenTelemetry initialized');
} catch (error) {
  console.error('Error initializing OTEL', error);
}
