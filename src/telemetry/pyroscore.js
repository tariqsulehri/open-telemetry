// src/telemetry/pyroscope.js
const Pyroscope = require('@pyroscope/nodejs');
const { context, trace } = require('@opentelemetry/api');

Pyroscope.init({
    appName: 'ecom.nodejs.user.service',
    serverAddress: 'http://localhost:4040',
    enableTracing: true,
    tags: {
        env: process.env.NODE_ENV || 'development',
        region: 'lahore',
    },
});

// 4. START SDK
try {
    Pyroscope.start();
    console.log('🚀 Pyroscope profiling started successfully');
} catch (error) {
    console.error('Error initializing OTEL', error);
}
