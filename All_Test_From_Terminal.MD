Step 1: Baseline "Healthy" Traffic
=================================
This test ensures Prometheus is recording request counts and Tempo is capturing successful spans.

Action: Run 5-10 requests to the /hello endpoint.

 Command: bash
 ================================
   for i in {1..10}; do curl http://localhost:3500/hello; done

 - What to check: In Grafana, the Request Rate should climb, and Tempo should show spans with a  duration of roughly 500ms (due to the setTimeout).

Step 2: Error and Alerting Test
=================================
This test populates Loki with error logs and tests your Prometheus alert logic for "High Error Rate."

Action: Hit the specific error endpoints.

Command Bash:
===================================
- curl http://localhost:3500/error_500
- curl http://localhost:3500/error_404

What to check: * Loki: Search for {level="error"}. You should see "Simulated Backend Crash."

 - Tempo: The trace for these requests should have a red circle or status=error.

Step 3: Latency and Warning Test
======================================
This tests the "Slow Search" logic to see if Loki warnings and Tempo spans correlate correctly.
Action: Call the /slow-search route.

- Command: bash 
=======================================
  curl http://localhost:3500/slow-search

What to check: Look for a log line saying "Search is taking longer than expected" inside a trace that lasts 800ms.

Step 4: Infrastructure Stress Test (cAdvisor)
This verifies that cAdvisor is correctly mapping Docker container names to CPU usage.

Action: Run the /rolldice route with a high number of rolls to spike CPU briefly.

Command: Bash

curl "http://localhost:3500/rolldice?rolls=100"

What to check: In Prometheus, run the query:
Code snippet
=============================================================
rate(container_cpu_usage_seconds_total{name="otel-app"}[1m])
(Replace "otel-app" with your actual container name).

Step 5: Statistical Variation Test
===================================================
This generates a "noisy" graph, which is great for testing Heatmaps and Percentile (P95) calculations.

Action: Hit the random status endpoint multiple times.
Command Bash
======================================
for i in {1..20}; do curl http://localhost:3500/random-status; sleep 0.5; 
done

What to check: Your dashboard should show a mix of 200, 400, and 500 status codes in a single time window.


🚦 Troubleshooting Checklist
=============================================
If you don't see data after running these:

Check cAdvisor: Run docker logs cadvisor. If you see "Permission Denied," ensure you are running with privileged: true.

- Check OTel Health: 
  Visit http://localhost:13133/ (the health check port). It should say "Server available."

- Check Prometheus: 
  Visit http://localhost:9090/targets and verify all targets are green.



Config Test:
docker run --rm -v $(pwd)/config:/config --entrypoint /bin/promtool prom/prometheus:latest check config /config/prometheus.yaml
Checking /config/prometheus.yaml
  SUCCESS: 1 rule files found
 SUCCESS: /config/prometheus.yaml is valid prometheus config file syntax

Checking /config/prometheus_rules/prometheus_rules.yaml
  SUCCESS: 3 rules found  