// Make sure instrumentation is loaded first

require('./src/telemetry/instrumentation-l7'); 

const express = require('express');
const { rollTheDice } = require('./dice.js');
const app = express();
const dotenv = require("dotenv");
// --- UPDATED PATH ---
const { info, error } = require('./src/loggers/logger'); // <-- Import the convenience wrappers

dotenv.config();

// Parse JSON and urlencoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

require('./src/startup/routes')(app);


app.get('/hello', (req, res) =>{
    // Use the simplified 'info' function
    info('Received request for /hello endpoint.', { customTag: 'node.service.otel' }); 
    
    setTimeout(() => {
       res.send('Hello World')
    }, 500);
});

app.get('/rolldice', (req, res) => {
    info('Received request for /rolldice endpoint.', { customTag: 'node.service.otel' });  
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res
      .status(400)
      .send("Request parameter 'rolls' is missing or not a number.");
    return;
  }
  res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));
});



let nodePort = process.env.PORT || 3500; 

app.listen(nodePort, ()=> {
    info(`Server is running on port: ${nodePort}` ); 
});