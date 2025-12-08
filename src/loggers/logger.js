
// src/loggers/logger.js (Simplified for OpenTelemetry Auto-Instrumentation)
const winston = require('winston');

// ----------------------------------------------------------------------
// WHY: We use the json() format because OpenTelemetry instrumentation 
//      knows how to inject 'trace_id' and 'span_id' into the log metadata 
//      BEFORE it's formatted as JSON.
// ----------------------------------------------------------------------
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.json()
);

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console(),
  ],
  // This metadata will appear on every log line, including correlated logs.
  defaultMeta: { service: process.env.SERVICE_NAME }, 
});

// ----------------------------------------------------------------------
// WHY: We only need simple wrappers now, as the trace/span injection 
//      is handled by the installed OTel Winston Instrumentation.
// ----------------------------------------------------------------------
const info = (msg, meta) => logger.info(msg, meta);
const warn = (msg, meta) => logger.warn(msg, meta);
const error = (msg, meta) => logger.error(msg, meta);

module.exports = {
  logger,
  info,
  warn,
  error,
};



// // logger.js
// const winston = require('winston');
// const { context, trace } = require('@opentelemetry/api');

// // Define a standardized log format using JSON for easy parsing by observability backends.
// const logFormat = winston.format.combine(
//   winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
//   winston.format.json()
// );

// // Create the logger instance
// const logger = winston.createLogger({
//   level: process.env.LOG_LEVEL || 'info', // Default level is 'info', can be changed via environment variable
//   format: logFormat,
//   transports: [
//     // Output all logs to the console. This is where OpenTelemetry's instrumentation will hook in.
//     new winston.transports.Console(),
//   ],
//   // Add metadata that should appear on every log line (e.g., service name)
//   defaultMeta: { service: 'professional-otel-api' },
// });

// // A helper to log with context
// function logWithContext(level, message, meta = {}) {
//   // get the current span from OpenTelemetry context
//   const span = trace.getSpan(context.active());
//   if (span) {
//     const spanContext = span.spanContext();
//     meta.trace_id = spanContext.traceId;
//     meta.span_id = spanContext.spanId;
//   }
//   logger.log(level, message, meta);
// }

// // Convenience wrappers
// const info = (msg, meta) => logWithContext('info', msg, meta);
// const warn = (msg, meta) => logWithContext('warn', msg, meta);
// const error = (msg, meta) => logWithContext('error', msg, meta);

// module.exports = {
//   logger,
//   info,
//   warn,
//   error,
// };
