require('./src/telemetry/instrumentation-l7'); 

const express = require('express');
const otel = require('@opentelemetry/api');
const { rollTheDice } = require('./dice.js');
const app = express();
const dotenv = require("dotenv");
const axios = require("axios")
const { info, error, warn } = require('./src/loggers/logger');

dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//---- External Call
// This route acts as a 'Client' calling a 'Server'
app.get('/trigger-service-graph', async (req, res) => {
   info('Triggering internal call to create a graph edge...');
    try {
        // CALLING ITSELF (Port 3500)
        const response = await axios.get(`http://localhost:3500/hello`); 
        res.status(200).json({ 
            message: "Check metrics in 15s - Both spans produced!", 
            data: response.data 
        });
    } catch (err) {
        error('Failed', { error: err.message });
        res.status(500).send(err.message);
    }
});



// --- Standard Routes ---
app.get('/hello', (req, res) =>{
    info('Received request for /hello endpoint.', { endpoint: '/hello' }); 
    setTimeout(() => {
       res.json('Hello World');
    }, 500); // Simulates network/db latency
});

app.get('/rolldice', (req, res) => {
  // 1. First, extract and parse the variable from the request
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;

  // 2. Now you can safely use 'rolls' for logging
  info('Received request for /rolldice endpoint.', { customTag: 'node.service.otel', rolls });  

  // 3. Validation
  if (isNaN(rolls)) {
    res.status(400).send("Request parameter 'rolls' is missing or not a number.");
    return;
  }
  // 4. Pass it to your logic
  res.json(JSON.stringify(rollTheDice(rolls, 1, 6)));
});

/**
 * 1. SIMULATED ERROR: For testing Loki Error highlighting & Tempo error spans
 */
app.get('/error_500', (req, res) => {
    try {
        error('A critical failure occurred!', { detail: 'Database connection simulated timeout' });
        throw new Error("Simulated Backend Crash");
    } catch (e) {
        error(`Caught Exception: ${e.message}`);
        res.status(500).json({ error: true, message: e.message });
    }
});

app.get('/error_400', (req, res) => {
    try {
        error('A Bad request!', { detail: 'Invalid request format/data provided' });
        throw new Error("Bad Request");
    } catch (e) {
        error(`Caught Exception: ${e.message}`);
        res.status(400).json({ error: true, message: e.message });
    }
});

app.get('/error_403', (req, res) => {
    try {
        error('Forbidden!', { detail: 'Access denied...' });
        throw new Error("Bad Request");
    } catch (e) {
        error(`Forbidden!: ${e.message}`);
        res.status(403).json({ error: true, message: e.message });
    }
});

app.get('/error_404', (req, res) => {
    try {
        error('Not Found!', { detail: 'Requested resource not found.. ...' });
        throw new Error("Bad Request");
    } catch (e) {
        error(`Not Found!: ${e.message}`);
        res.status(404).json({ error: true, message: e.message });
    }
});

app.get('/error_408', (req, res) => {
    try {
        error('Time Out!', { detail: 'Requested time out.. ...' });
        throw new Error("Time out!");
    } catch (e) {
        error(`Time out!: ${e.message}`);
        res.status(408).json({ error: true, message: e.message });
    }
});

/**
 * 2. MIXED LOGGING: For testing log levels in Grafana
 */
app.get('/slow-search', (req, res) => {
    info('Starting slow search operation...');
    
    // Simulate a warning halfway through
    setTimeout(() => {
        warn('Search is taking longer than expected...', { threshold: '200ms' });
    }, 300);

    setTimeout(() => {
        info('Search completed successfully.');
        res.json({ results: [], time: '800ms' });
    }, 800);

});

/**
 * 3. RANDOM STATUS: For testing Prometheus metric spikes (4xx/5xx)
 */
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

let nodePort = process.env.PORT || 3500; 

app.listen(nodePort, ()=> {
    info(`🚀 App Server running on port: ${nodePort}` ); 
});