/* instrumentation.js */
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { WinstonInstrumentation } = require('@opentelemetry/instrumentation-winston');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-proto');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-proto');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http')
const { resourceFromAttributes } = require('@opentelemetry/resources');
const {ExpressInstrumentation} = require('@opentelemetry/instrumentation-express')
const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base')
const { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } = require('@opentelemetry/semantic-conventions');

// 1. Define your service name (so you find it in your dashboard)
const resource = new resourceFromAttributes({
  [ATTR_SERVICE_NAME]: 'my-node-service',
  [ATTR_SERVICE_VERSION]: '1.0.0',
});

// 2. Configure where to send Traces (using OTLP)
const traceExporter = new OTLPTraceExporter({
  // Endpoint URL for Jaeger or OTel Collector (default is http://localhost:4318/v1/traces)
  url: 'http://localhost:4318/v1/traces', 
});

// 3. Configure where to send Metrics
const metricReader = new PeriodicExportingMetricReader({
  exporter: new OTLPMetricExporter({
    url: 'http://localhost:4318/v1/metrics',
  }),
  exportIntervalMillis: 10000, // Send metrics every 10 seconds
});


const bsp = new BatchSpanProcessor(traceExporter, {
  maxExportBatchSize: 1000,
  maxQueueSize: 1000,
})

// 4. Initialize the SDK
const sdk = new NodeSDK({
  resource: resource,
  traceExporter: traceExporter,
  metricReader: metricReader,
  instrumentations: [
    // Automatically instrument common libraries (Express, Http, etc.)
    getNodeAutoInstrumentations({
      // specialized config can go here if needed, e.g., disabling fs instrumentation
      '@opentelemetry/instrumentation-fs': { enabled: false },
    }),
    new ExpressInstrumentation(),
    new HttpInstrumentation(),
    // // Specifically instrument Winston for Logs
    // new WinstonInstrumentation({
    //     // This hook injects trace_id and span_id into your logs automatically!
    //     logHook: (span, record) => {
    //         record['resource.service.name'] = 'my-node-service';
    //     },
    // }),
  ],
});


// 5. Start the SDK
sdk.start();

console.log('OpenTelemetry initialized');

// Graceful shutdown
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});