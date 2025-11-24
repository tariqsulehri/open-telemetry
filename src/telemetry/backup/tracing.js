const opentelemetry = require('@opentelemetry/api');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const {
    ATTR_SERVICE_NAME,
    ATTR_SERVICE_VERSION,
  } = require('@opentelemetry/semantic-conventions');

  const {
    BatchSpanProcessor,
  } = require('@opentelemetry/sdk-trace-base');
  
const {ZipkinExporter} =  require('@opentelemetry/exporter-zipkin');

const {
    defaultResource,
    resourceFromAttributes,
  } = require('@opentelemetry/resources');

const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const exporter = new ZipkinExporter({
    serviceName: "node-logging-service",
    url: "http://localhost:9411/api/v2/spans"
})

const resource = defaultResource().merge(
    resourceFromAttributes({
      [ATTR_SERVICE_NAME]: 'node-otel-service',
      [ATTR_SERVICE_VERSION]: '0.1.0',
    }),
);

const spanProcessor = new BatchSpanProcessor(exporter);
const provider = new NodeTracerProvider({ 
    resource : resource,
    spanProcessors: [spanProcessor]
});

provider.register();

registerInstrumentations({
    // // when boostraping with lerna for testing purposes
    instrumentations: [
      new HttpInstrumentation(),
    ],
  });

  return opentelemetry.trace.getTracer('node-server', '0.1.0');
