/* service-a.js */
require('./src/telemetry/instrumentation-l5');
const express = require('express');
const cors = require('cors');
const winston = require('winston');
const { metrics } = require('@opentelemetry/api');
const { Client } = require('pg'); // <--- 1. Import Postgres

// --- SETUP LOGGING & METRICS ---
const logger = winston.createLogger({
  level: 'info',
  transports: [ new winston.transports.Console() ],
});
const meter = metrics.getMeter('shop-service-meter');
const itemsSoldCounter = meter.createCounter('items_sold');

// --- SETUP DATABASE ---
const dbClient = new Client({
  user: 'postgres',
  host: 'localhost', // Since Node is running on Mac, we access Docker via localhost
  database: 'shop_db',
  password: '786Allahis1',
  port: 5432,
});

// Connect to DB immediately
dbClient.connect()
  .then(() => console.log('Connected to Postgres'))
  .catch(err => console.error(' DB Connection Error:', err));

const app = express();
app.use(cors());

app.get('/buy', async (req, res) => {
  itemsSoldCounter.add(1, { category: 'electronics' });
  logger.info('User is buying an item', { item_id: '99' });

  try {
    // --- DATABASE QUERY ---
    // We simulate a slow query using pg_sleep(0.5) = 500ms delay
    // OTEL will automatically capture this!
    const result = await dbClient.query('SELECT NOW(), pg_sleep(0.8)');
    
    res.json({ 
      status: 'Purchase Complete', 
      db_time: result.rows[0].now 
    });
  } catch (err) {
    logger.error('Database query failed', { error: err.message });
    res.status(500).json({ error: "DB Error" });
  }
});

app.listen(3000, () => console.log('Shop running on 3000'));