Step 2: The Test (Seeing Red)
==============================

Restart the App:

Code Bash
node service-a.js

- Trigger the Crash:
----------------------
- Open your browser and go to: http://localhost:3000/crash
  (You should see {"error": "Something went wrong"}).

- Inspect Jaeger (The Visual Proof):
-------------------------------------
- Go to http://localhost:16686.
- Service: shop-service.

- Find Traces.
  Look for the Trace: You should see a trace for GET /crash.
  Is there a Red Icon? It should have a red exclamation mark or be colored red.

- Click the Trace:
- Click the Span (GET /crash).
- Expand "Logs" (or "Events" depending on Jaeger version).

- Result: You will see the full JavaScript stack trace (Error: Critical Database Failure... at app.get...) saved forever in the trace.

- Inspect Grafana (Loki):
  - Query {service_name="shop-service"}.
    You should see the log line Request failed highlighted in Red/Orange.
    Once you confirm you see the RED trace in Jaeger, we are done with the Backend.



http://localhost:8889/metrics



- Commands:
-----------------
export SERVICE_NAME=shop-service && node service-a.js