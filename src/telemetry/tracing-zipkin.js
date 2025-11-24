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

const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express')



const serviceName = 'node-otel-service';
const serviceVersion = '0.1.0'
//----------
const resource = defaultResource().merge(
    resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
      [ATTR_SERVICE_VERSION]: serviceVersion,
      'my-custom-resource': "custom-resource-data",
    }),
);

const spanProcessor = new BatchSpanProcessor(exporter, {
  scheduledDelayMillis: 7000
});

const provider = new NodeTracerProvider({ 
    resource : resource,
    spanProcessors: [spanProcessor]
});

provider.register();


registerInstrumentations({
    // // when boostraping with lerna for testing purposes
    instrumentations: [
      new ExpressInstrumentation({
        requestHook: (span, reqInfo) => {
          span.setAttribute('req-headers', JSON.stringify(reqInfo.request.headers))
        }
      }),

      new HttpInstrumentation(),
    ],
  });

  return opentelemetry.trace.getTracer(serviceName);
