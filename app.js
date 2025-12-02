require('./src/telemetry/instrumentation');

const express = require('express');
const app = express();
const dotenv = require("dotenv");

dotenv.config();

app.get('/hello', (req, res) =>{
    setTimeout(() => {
       res.send('Hello World')
    }, 500);
})

let nodePort = process.env.PORT || 3500; 

app.listen(nodePort, ()=> {console.log(`Server is running on port: ${nodePort}` )});