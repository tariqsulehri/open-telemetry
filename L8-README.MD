Level 8: Database Instrumentation (The "X-Ray" Vision)
The Concept:
In a real backend, 90% of latency usually comes from the Database.
Without OTEL: You see "Request took 500ms". You don't know if it was CPU work or a slow SQL query.
With OTEL: You see "Request took 500ms" 
→
→
 "Select * from users took 490ms".
The Magic:
You do not need to manually create spans for database queries. The getNodeAutoInstrumentations() function in your SDK automatically detects when you use the pg (Postgres) library and creates spans for you.
Step 1: Add Postgres to docker-compose.yml
We need a real database to talk to.
Add this service to your docker-compose.yml (under services:):
code
Yaml
# -----------------------------------------------------------
  # 6. POSTGRES (The Database)
  # -----------------------------------------------------------
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: shop_db
    ports:
      - "5432:5432" # Expose to your Mac (Localhost)
    networks:
      - obs-net
Apply the change:
code
Bash
docker-compose up -d
(Wait 10 seconds for the DB to start).
Step 2: Install Postgres Driver
In your Node.js project folder:
code
Bash
npm install pg
Step 3: Update service-a.js
We will modify the code to connect to the database and run a "simulated slow query" every time you buy an item.
Update service-a.js:
code
JavaScript
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
  user: 'user',
  host: 'localhost', // Since Node is running on Mac, we access Docker via localhost
  database: 'shop_db',
  password: 'password',
  port: 5432,
});

// Connect to DB immediately
dbClient.connect()
  .then(() => console.log('✅ Connected to Postgres'))
  .catch(err => console.error('❌ DB Connection Error:', err));

const app = express();
app.use(cors());

app.get('/buy', async (req, res) => {
  itemsSoldCounter.add(1, { category: 'electronics' });
  logger.info('User is buying an item', { item_id: '99' });

  try {
    // --- DATABASE QUERY ---
    // We simulate a slow query using pg_sleep(0.5) = 500ms delay
    // OTEL will automatically capture this!
    const result = await dbClient.query('SELECT NOW(), pg_sleep(0.5)');
    
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
Step 4: The Verification Test
Restart the App:
code
Bash
node service-a.js
(Ensure it says "✅ Connected to Postgres")
Generate Traffic:
Go to http://localhost:3000/buy.
Notice it feels a bit slower? That's the 500ms sleep we added.
Check Jaeger (The "X-Ray"):
Go to http://localhost:16686.
Find Trace for shop-service.
Click the Trace.
What you should see:
You will see a Waterfall:
Top Bar: GET /buy (The HTTP Request) - Total time ~510ms.
Child Bar: pg.query: SELECT (The Database Query) - Total time ~500ms.
Click the Child Bar (pg.query):
Look at the Tags (Attributes).
You will see:
db.system: postgresql
db.statement: SELECT NOW(), pg_sleep(0.5)
net.peer.name: localhost
Conclusion:
You didn't write a single line of code to trace the database. OpenTelemetry intercepted the dbClient.query call and did it for you. This is how you find bottlenecks in production.
Level 8 Complete!
You now have a Full Stack Backend (App + DB) fully observable.