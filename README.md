# 🌐 Ecom Node.js User Service: Observability Stack

This repository contains a Node.js microservice integrated with a **Full-Stack Observability Pipeline**. It uses OpenTelemetry for auto-instrumentation, with **AWS S3** serving as the persistence layer for traces and logs.



## 🏗️ Architecture Overview

The observability pipeline follows the **OpenTelemetry (OTel)** standard:
1. **App**: Node.js application using `instrumentation.js` for auto-instrumentation.
2. **Collector**: Centralized OTel Collector processing Traces, Metrics, and Logs.
3. **Storage (Persistence)**:
   - **Metrics**: Prometheus (Local storage).
   - **Traces**: Grafana Tempo (Stored in **AWS S3**).
   - **Logs**: Grafana Loki (Stored in **AWS S3**).
4. **Service Graph**: Automated dependency mapping via the `servicegraph` connector.

---

## 🚀 Quick Start (Development)

### 1. Environment Configuration
Create a `.env` file in the root directory:
```bash
PORT=3500
OTEL_SERVICE_NAME=ecom.nodejs.user.service
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318

# AWS Credentials
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-abc-1
```

### 2. Launch Infrastructure
```bash
# Starts Loki, Tempo, Prometheus, Grafana, and OTel Collector
docker-compose up -d
```

### 3. Run Application with OTel Bootstrap
```bash
# Node.js must be started with the instrumentation requirement
node --require ./telemetry/instrumentation.js app.js
```

---

## 👩‍💻 Developer Manual

### Observability Bootstrap
Observability is initialized via the **Bootstrap Pattern**. The file `/telemetry/instrumentation.js` handles the SDK setup. 

**Auto-instrumentation covers:**
- `http` & `https` incoming/outgoing requests.
- `express` routing and middleware.
- `axios` outbound API calls.

### Structured Logging
Always use the internal logger located in `./src/loggers/logger`. It ensures that every log line contains the `traceID`, allowing for **Log-to-Trace correlation** in Grafana.

---

## 📊 User & Operator Manual

### Accessing Dashboards
| Component | URL | Credential |
| :--- | :--- | :--- |
| **Grafana** | `http://localhost:3000` | admin / admin |
| **Prometheus** | `http://localhost:9090` | N/A |
| **Collector Metrics** | `http://localhost:8889/metrics` | N/A |

### Critical Workflows
1. **Service Dependency Graph**: Navigate to **Explore > Tempo > Service Graph**. This shows real-time traffic flow.
2. **Log-to-Trace Correlation**: In the Loki logs panel, click on any log entry. Click the **Tempo** button next to the `traceID` to view the full request lifecycle.



---

## 🛠️ Operational & Debug Commands

### 1. Check Collector Intake
Verify if the Collector is receiving spans from your Node.js app:
```bash
curl http://localhost:8888/metrics | grep otlp_receiver_accepted_spans
```

### 2. Generate Traffic for Service Graph
Run this to generate 20 requests and force a graph update:
```bash
for i in {1..20}; do curl http://localhost:3500/trigger-service-graph; echo " Request $i"; sleep 0.5; done
```

### 3. Debug AWS S3 Storage
Check for permission or connection errors in the storage backends:
```bash
docker logs loki 2>&1 | grep -i "s3"
docker logs tempo 2>&1 | grep -i "s3"
```

---

## 📂 Configuration Files
- `config/collector-config.yaml`: Core OTel logic and Service Graph connector.
- `config/loki-config.yaml`: S3 storage configuration for logs.
- `config/tempo-config.yaml`: S3 storage configuration for traces.
- `config/grafana_provisioning/`: Automated datasource and dashboard setup.
