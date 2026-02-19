/**
 * ============================================================
 * 1️⃣  INITIALIZE TELEMETRY FIRST (VERY IMPORTANT)
 * ============================================================
 */
require('./src/telemetry/instrumentation'); // OTEL must be first
require('./src/telemetry/pyroscore');

/**
 * ============================================================
 * 2️⃣  IMPORTS
 * ============================================================
 */
const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
const { context, trace } = require('@opentelemetry/api');
const Pyroscope = require('@pyroscope/nodejs');
const { rollTheDice } = require('./dice.js');
const { info, error, warn } = require('./src/loggers/logger');

dotenv.config();

const app = express();
const nodePort = process.env.PORT || 3500;
const PYROSCOPE_URL = process.env.PYROSCOPE_URL || 'http://pyroscope:4040';
const PROFILE_THRESHOLD_MS = 500;

/**
 * ============================================================
 * 3️⃣  MIDDLEWARE
 * ============================================================
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * 🔥 Conditional Slow-Trace Profiling Middleware
 */
// app.use((req, res, next) => {
//     const startTime = Date.now();

//     const span = trace.getSpan(context.active());
//     const traceId = span?.spanContext()?.traceId || 'unknown';

//     Pyroscope.init({
//         appName: 'ecom.nodejs.user.service', // MUST match OTEL service.name
//         serverAddress: 'http://localhost:4040',
//         tags: {
//             route: req.path,
//             method: req.method,
//             trace_id: traceId,
//         },
//     });

//     Pyroscope.start();

//     // res.on('finish', async () => {
//     //     try {
//     //         const duration = Date.now() - startTime;

//     //         await Pyroscope.stop();

//     //         // Keep only slow OR server-error requests
//     //         if (duration < PROFILE_THRESHOLD_MS && res.statusCode < 500) {
//     //             await Pyroscope.delete();
//     //         }

//     //     } catch (err) {
//     //         console.error('Profiler error:', err.message);
//     //     }
//     // });

//     next();
// });

/**
 * ============================================================
 * 4️⃣  ROUTES
 * ============================================================
 */

app.get('/debug/cpu-stress', (req, res) => {
    const start = Date.now();
    while (Date.now() - start < 2000) {
        Math.random() * Math.random();
    }
    res.send('CPU stress test complete');
});

app.get('/slow', (req, res) => {
    info('Slow endpoint started');

    const start = Date.now();
    while (Date.now() - start < 1000) { }

    info('Slow endpoint finished');

    res.send('slow done');
});


app.get('/hello', (req, res) => {
    info('Received request for /hello endpoint.');
    setTimeout(() => {
        res.json('Hello World');
    }, 500);
});

app.get('/trigger-service-graph', async (req, res) => {
    info('Triggering internal call...');
    try {
        const response = await axios.get(`http://localhost:${nodePort}/hello`);
        res.status(200).json({
            message: 'Check metrics in 15s - Both spans produced!',
            data: response.data,
        });
    } catch (err) {
        error('Failed', { error: err.message });
        res.status(500).send(err.message);
    }
});

app.get('/rolldice', (req, res) => {
    const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;

    if (isNaN(rolls)) {
        return res.status(400).send("Request parameter 'rolls' is missing or not a number.");
    }

    info('Received request for /rolldice', { rolls });
    res.json(rollTheDice(rolls, 1, 6));
});

/**
 * ============================================================
 * 5️⃣  ERROR TEST ROUTES
 * ============================================================
 */
app.get('/error_500', (req, res) => {
    error('Simulated Backend Crash');
    res.status(500).json({ error: true, message: 'Simulated Backend Crash' });
});

app.get('/random-status', (req, res) => {
    const codes = [200, 201, 400, 401, 403, 500, 503];
    const randomCode = codes[Math.floor(Math.random() * codes.length)];

    if (randomCode >= 400) {
        error(`Returning failure status code: ${randomCode}`);
    } else {
        info(`Returning success status code: ${randomCode}`);
    }

    res.status(randomCode).send(`Status returned: ${randomCode}`);
});

/**
 * ============================================================
 * 6️⃣  START SERVER
 * ============================================================
 */
app.listen(nodePort, () => {
    info(`🚀 App Server running on port: ${nodePort}`);
});
