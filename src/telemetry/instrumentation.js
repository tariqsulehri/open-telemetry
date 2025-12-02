/* instrumentation.ts */
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { ConsoleSpanExporter, SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const {} = require("@opentelemetry/exporter-trace-otlp-http");

// 1. Where do we send the data? -> To the Console (Terminal) for now.
// We use SimpleSpanProcessor for development (instant logging).
const traceExporter = new ConsoleSpanExporter();
const spanProcessor = new SimpleSpanProcessor(traceExporter);

const sdk = new NodeSDK({
  serviceName: 'my-first-service',
  // 2. We attach the processor to the SDK
  spanProcessor: spanProcessor,
  // 3. Auto-instrumentation (The "Magic" that hooks into HTTP/Express)
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
console.log('OTEL SDK Started - Watching for signals...');