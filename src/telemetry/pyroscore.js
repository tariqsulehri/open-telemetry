// src/telemetry/pyroscope.js
const Pyroscope = require('@pyroscope/nodejs');

Pyroscope.init({
    serverAddress: 'http://pyroscope:4040',
    appName: 'ecom.nodejs.user.service',
    tags: {
        env: process.env.NODE_ENV || 'development',
    },
});

// 4. START SDK
try {
    Pyroscope.start();
    console.log('🚀 Pyroscope profiling started successfully');
} catch (error) {
    console.error('Error initializing OTEL', error);
}
