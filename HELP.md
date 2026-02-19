# 🌐 Observability Stack: Node.js Microservice

![Node.js](https://img.shields.io/badge/Node.js-18.x-green?style=flat&logo=node.js)
![OpenTelemetry](https://img.shields.io/badge/OpenTelemetry-Auto_Instrumentation-blue?style=flat&logo=opentelemetry)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker)
![Grafana](https://img.shields.io/badge/Grafana-9.x-orange?style=flat&logo=grafana)

This repository contains a Node.js microservice integrated with a **Full-Stack Observability Pipeline**. It leverages **OpenTelemetry (OTel)** for auto-instrumentation, **Grafana LGT (Loki, Grafana, Tempo)** for visualization, and **AWS S3** for persistent storage of traces and logs.

---

## 🏗️ Architecture Overview

The observability pipeline follows the **OpenTelemetry (OTel)** standard for cloud-native telemetry collection:

| Component | Description | Technologies | Persistence |
| :--- | :--- | :--- | :--- |
| **Application** | Node.js service using `instrumentation.js` | Node.js, Express, Axios | N/A |
| **Collector** | Centralized processor for Traces, Metrics, Logs | OpenTelemetry Collector | Buffer (Disk) |
| **Metrics** | Infrastructure & Application time-series data | Prometheus | Local Volume |
| **Traces** | Distributed request tracing & spans | Grafana Tempo | **AWS S3** |
| **Logs** | Structured logs with trace correlation | Grafana Loki | **AWS S3** |

---

## 🚀 Quick Start (Development)

Follow these steps to get the stack running locally.

### 1. Environment Configuration
Create a `.env` file in the root directory with your AWS credentials:

```bash
PORT=3500
OTEL_SERVICE_NAME=ecom.nodejs.user.service
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318

# AWS Credentials for S3 Persistence (Loki/Tempo)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-abc-1
```

### 2. Launch Infrastructure
Start the entire observability stack using Docker Compose:

```bash
# Starts Loki, Tempo, Prometheus, Grafana, and OTel Collector
docker-compose up -d
```

### 3. Run Application
Start the Node.js application. Note that it must be required with the instrumentation script to enable telemetry.

```bash
# Bootstrap with telemetry instrumentation
node --require ./telemetry/instrumentation.js app.js
```

---

## 👩‍💻 Developer Manual

### Observability Bootstrap
Observability is initialized via the **Bootstrap Pattern**. The file `src/telemetry/instrumentation.js` handles the SDK setup *before* the application starts.

**Auto-instrumentation covers:**
*   `http` & `https` incoming/outgoing requests
*   `express` routing and middleware performance
*   `axios` outbound API calls and context propagation
*   `pg` (Postgres) database queries

### Structured Logging
Always use the internal logger located in `src/utils/logger.js`. It automatically injects the current `traceID` and `spanID` into every log line.

```javascript
const logger = require('../utils/logger');

// Logs will include "trace_id": "..." for correlation in Grafana
logger.info("Processing user payment", { userId: "u-123", amount: 50.00 });
```

---

## 📊 User & Operator Manual

### Accessing Dashboards
Access the various components of the stack via your browser:

| Component | URL | Default Credential |
| :--- | :--- | :--- |
| **Grafana** | `http://localhost:3000` | `admin` / `admin` |
| **Prometheus** | `http://localhost:9090` | *None* |
| **Collector Metrics** | `http://localhost:8889` | *None* |
| **Application** | `http://localhost:3500` | *None* |

### Critical Workflows
1.  **Service Dependency Graph (RED Metrics)**
    *   Navigate to **Explore > Tempo > Service Graph** in Grafana.
    *   This view visualizes real-time traffic flow, latency, and error rates between services.

2.  **Log-to-Trace Correlation**
    *   In the **Loki** explorer, query for logs (e.g., `{service_name="ecom.nodejs.user.service"}`).
    *   Expand a log entry. You will see a `traceID` field.
    *   Click the **Tempo** button next to the `traceID` to jump directly to the full distributed trace for that request.

---

## 🛠️ Operational & Debug Commands

### 1. Verify Collector Intake
Check if the Collector is successfully receiving spans from your app:

```bash
curl -s http://localhost:8888/metrics | grep otlp_receiver_accepted_spans
```

### 2. Generate Traffic
Run this loop to generate 20 requests, which will populate the Service Graph and traces:

```bash
for i in {1..20}; do 
  curl -s http://localhost:3500/trigger-service-graph > /dev/null
  echo "Request $i sent"
  sleep 0.5
done
```

### 3. Debug AWS S3 Storage
If traces or logs are not persisting, check the backend logs for S3 permission errors:

```bash
# Check Loki logs for S3 errors
docker logs loki 2>&1 | grep -i "s3"

# Check Tempo logs for S3 errors
docker logs tempo 2>&1 | grep -i "s3"
```

---

## 📂 Configuration Reference

*   **`config/otel-config.yaml`**: Core OTel Collector pipelines and Service Graph connector.
*   **`config/loki-config.yaml`**: Loki configuration including S3 retention and schema.
*   **`config/tempo-config.yaml`**: Tempo configuration for distributed tracing and S3 backend.
*   **`config/prometheus.yaml`**: Prometheus scrape jobs and target discovery.
*   **`config/grafana_provisioning/`**: Automated setup for data sources and dashboards.






