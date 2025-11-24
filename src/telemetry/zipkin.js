const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');

// Add your zipkin url (`http://localhost:9411/api/v2/spans` is used as
// default) and application name to the Zipkin options.
// You can also define your custom headers which will be added automatically.
const options = {
  headers: {
    'my-header': 'header-value',
  },
  url: 'your-zipkin-url',
  // optional interceptor
  getExportRequestHeaders: () => {
    return {
      'my-header': 'header-value',
    }
  }
}
const exporter = new ZipkinExporter(options);


// // Configure Zipkin (traces)
// const zipkinOptions = {
//     // headers:{
//     //    "custom-header":"ZipkinCustomHeader"
//     // },
//     // getExporterRequestHeaders:()=>{
//     //      return{
//     //           ...headers
//     //      }
//     // },
//     url: "http://localhost:9411/api/v2/spans", // Docker service name: zipkin
//     serviceName: 'node-otel-demo'
  
//   };