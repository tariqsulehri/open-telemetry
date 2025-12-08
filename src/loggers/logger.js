const winston = require('winston');
const { WinstonInstrumentation } = require('@opentelemetry/instrumentation-winston');
const { context, trace } = require('@opentelemetry/api');

// Simple winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ],
});

// Helper functions
function info(msg, meta = {}) {
  const span = trace.getSpan(context.active());
  if (span) {
    meta.trace_id = span.spanContext().traceId;
    meta.span_id = span.spanContext().spanId;
  }
  logger.info(msg, meta);
}

function error(msg, meta = {}) {
  const span = trace.getSpan(context.active());
  if (span) {
    meta.trace_id = span.spanContext().traceId;
    meta.span_id = span.spanContext().spanId;
  }
  logger.error(msg, meta);
}

module.exports = { info, error };
