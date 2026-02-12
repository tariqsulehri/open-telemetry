const winston = require('winston');
const { trace, context } = require('@opentelemetry/api');

// Custom format to ensure trace context is always present in JSON
const otelFormat = winston.format((info) => {
  const span = trace.getSpan(context.active());
  if (span) {
    const { traceId, spanId } = span.spanContext();
    // Use the exact keys 'trace_id' and 'span_id' to match your Loki derived fields config
    info.trace_id = traceId;
    info.span_id = spanId;
  }
  return info;
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    otelFormat(), // Automatically injects trace data
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ],
});

// Refined Helper functions using the logger directly
const info = (msg, meta = {}) => {
    // manual context injection logic here
    logger.info(msg, meta);
};

const error = (msg, meta = {}) => {
    logger.error(msg, meta);
};

const warn = (msg, meta = {}) => {
    logger.warn(msg, meta);
};

// --- THIS PART IS CRITICAL ---
module.exports = { 
    info, 
    error, 
    warn 
};