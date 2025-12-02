require('./src/telemetry/instrumentation');

const express = require('express');
const app = express();

app.get('/hello', (req, res) =>{
    setTimeout(() => {
       res.send('Hello World')
    }, 500);
})


app.listen(3000, ()=> {console.log("Server is running on port 3000")});