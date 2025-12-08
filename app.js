// Make sure instrumentation is loaded first
require('./src/telemetry/instrumentation-l7'); 

const express = require('express');
const app = express();
const dotenv = require("dotenv");
// --- UPDATED PATH ---
const { info, error } = require('./src/loggers/logger'); // <-- Import the convenience wrappers

dotenv.config();

app.get('/hello', (req, res) =>{
    // Use the simplified 'info' function
    info('Received request for /hello endpoint.', { customTag: 'node.service.otel' }); 
    
    setTimeout(() => {
       res.send('Hello World')
    }, 500);
});

let nodePort = process.env.PORT || 3500; 

app.listen(nodePort, ()=> {
    info(`Server is running on port: ${nodePort}` ); 
});