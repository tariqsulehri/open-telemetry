Step 2: The Verification Test
We need to prove that we are losing Traces but keeping Metrics.
Restart the App:
code
Bash
node service-a.js
(Look for "✅ Level 7..." in the terminal)
Generate Traffic (Exact Count):
Refresh http://localhost:3000/buy exactly 20 times.
(Count them!)
Check Jaeger (Traces):
Go to http://localhost:16686.
Find Traces for shop-service.
Result: You should NOT see 20 traces. You should see approximately 10 traces (because of the 50% ratio).
Check Grafana (Metrics):
Go to http://localhost:3001/explore.
Datasource: Prometheus.
Query: items_sold_total (or increase(items_sold_total[5m])).
Result: You should see that the counter increased by 20.
Conclusion:
You have successfully implemented Cost Control. The Ops team is happy because you are saving disk space (fewer traces), but the Business team is happy because the dashboards are still accurate (100% metrics).
