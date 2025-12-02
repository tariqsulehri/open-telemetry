// instrumentation-l3.ts
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');
// 1. Import Diagnostics
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');

// 2. Enable logging. This will print "items to be sent" or "connection refused" to your terminal.
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const sdk = new NodeSDK({
  serviceName: process.env.SERVICE_NAME || 'debug-service', // Fallback name if env is missing
  traceExporter: new OTLPTraceExporter({
    // 3. FORCE IPv4. Do not use 'localhost'.
    url: 'http://127.0.0.1:4317', 
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

console.log(`OTEL SDK Started for service: ${process.env.SERVICE_NAME}`);