This is the moment of truth. We will perform a Full Stack Verification to confirm that your code, collector, and databases (Jaeger, Prometheus, Loki) are all talking to each other.
Here is your Detailed Testing Protocol.

- Phase 1: The Infrastructure Check
    Before running code, we must ensure the "Data Center" is online.
    Terminal 1 (Infrastructure):
    Run this command:
    -----------------
    Code Bash

    docker ps
    
    Verify the Lst:
    ---------------
    You must see 5 containers running with Status "Up":
    - otel-collector-contrib (The Router)
    - jaeger (Traces)
    - prometheus (Metrics)
    - loki (Logs)
    - grafana (The Dashboard)

If otel-collector is missing, stop here. We need to fix the docker-compose.yml image.

- Phase 2: The Data Trigger

  Now we run the application and create "Noise" for the system to record.
- Terminal 2 (The App):
  ----------------------
  Start your service with the Level 5 (Winston+Metrics) setup.

Code Bash
--------------
# Mac/Linux
export SERVICE_NAME=shop-service && node service-a.js

# Windows PowerShell
$env:SERVICE_NAME="shop-service"; node service-a.js

Expectation: You see Level 5 (Pro)... and Shop running on 3000.
Generate Traffic:
Open your browser to: http://localhost:3000/buy

Hit Refresh 5 to 10 times.

Why? Metrics usually export every 5-15 seconds. Generating multiple requests ensures data is batched and sent.

- Phase 3: Verify The Three Pillars
  1. Verify TRACES (Did it happen?)
  ----------------------------------
  URL: http://localhost:16686 (Jaeger UI)
  
  Action: Select Service: shop-service.
  Click Find Traces.

Expectation:
You should see a list of traces (e.g., GET /buy).
Click one. You see the timeline bar.
Status: PASS / FAIL

2. Verify METRICS (How many times?)
URL: http://localhost:9090 (Prometheus UI)
Action: In the big text box, type: items_sold_total
(Note: If that doesn't work, try items_sold - it depends on how OTEL normalized the name).
Click Execute.
Click the Table tab (next to Graph).
Expectation:
You should see a row with shop-service and a value (e.g., 5 or 10).
Status: PASS / FAIL
3. Verify LOGS (What did it say?)
URL: http://localhost:3001 (Grafana)
Action:
Menu: Click the Compass icon (Explore) on the left sidebar.
Source: Select Loki from the dropdown at the top (it might say "Prometheus" by default).
Label Browser:
Click "Label browser".
Select service_name.
Select shop-service.
Click "Show logs".
Or Manual Query: Type {service_name="shop-service"} and press Shift+Enter.
Expectation:
You see lines like: User is buying an item.
Status: PASS / FAIL
Phase 4: The "Pro" Verification (Correlation)
This is what separates a Junior from a Senior. We check if Logs are linked to Traces.
Stay in Grafana (Loki) view.
Find a log line: User is buying an item.
Click on that log line to expand it.
Look for "Fields" or "Derived Fields":
Do you see trace_id?
Is there a blue/green button next to it that says "Jaeger" or "Tempo"?
Click that button.
It should split the screen and show you the Trace that belongs to that specific Log.
Troubleshooting Checklist
No Metrics? Wait 15 seconds. The PeriodicExportingMetricReader buffers data.
No Logs? Check otel-config.yaml. Did you add the resource processor to add the service_name label? Loki drops logs if they don't have labels.
Grafana Empty? Ensure grafana-datasources.yaml was mounted correctly in docker-compose.yml.