// src/telemetry.js
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { } =  require('')
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');

// Optional: Enable logging for debugging OpenTelemetry
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// Configure Zipkin (traces)
const zipkinOptions = {
  // headers:{
  //    "custom-header":"ZipkinCustomHeader"
  // },
  // getExporterRequestHeaders:()=>{
  //      return{
  //           ...headers
  //      }
  // },
  url: "http://localhost:9411/api/v2/spans", // Docker service name: zipkin
  serviceName: 'node-otel-demo'

};

const zipkinExporter = new ZipkinExporter(zipkinOptions);

// Configure Prometheus (metrics)
const prometheusExporter = new PrometheusExporter(
  { port: 9464, startServer: true },
  () => console.log('Prometheus scrape endpoint: http://localhost:9464/metrics')
);

// Initialize OpenTelemetry Node SDK
const sdk = new NodeSDK({
  traceExporter: zipkinExporter,
  metricExporter: prometheusExporter,
  instrumentations: [getNodeAutoInstrumentations()]
});

// Start SDK
sdk.start()
  // .then(() => console.log('OpenTelemetry initialized'))
  // .catch(err => console.error('Error initializing OpenTelemetry', err));

// module.exports = sdk;
