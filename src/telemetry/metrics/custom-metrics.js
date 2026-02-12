const client = require('prom-client');

const counter = new client.Counter({
  name: 'hello_requests_total',
  help: 'Total /hello requests',
});

module.exports = { counter };