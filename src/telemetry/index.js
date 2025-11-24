/**  
 *   telemetry/index.js
 *   This file initializes all OpenTelemetry components    
 *   and is required at the top of the main server.
*/

const {startTracing} = require('./tracing')
const {meter, requestCounter} =  require('./metrics')

module.exports {
    startTracing,
    meter,
    requestCounter
};