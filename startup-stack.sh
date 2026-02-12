#!/bin/bash

# --- Configuration ---
# The health check URL for the OTel Collector
COLLECTOR_URL="http://localhost:4318/v1/traces"

echo "🛠️  Starting Observability Infrastructure Containers..."

# 1. Start Docker containers in detached mode
if [ -f "docker-compose.yaml" ]; then
    echo "📦 Running docker-compose up..."
    # --wait is available in modern Docker Compose to wait for healthchecks
    docker-compose up -d
else
    echo "❌ Error: docker-compose.yaml not found in current directory."
    exit 1
fi

# 2. Health Check Loop
echo "⏳ Verifying OTel Collector health at $COLLECTOR_URL..."
MAX_RETRIES=15
COUNT=0

while [ $COUNT -lt $MAX_RETRIES ]; do
    # Send a dummy empty JSON to the OTLP/HTTP endpoint to see if it responds
    if curl -s -o /dev/null -X POST "$COLLECTOR_URL" -H "Content-Type: application/json" -d "{}" ; then
        echo "✅ Infrastructure is READY!"
        echo "----------------------------------------------------"
        echo "You can now start your app with:"
        echo "node --require ./telemetry/instrumentation.js app.js"
        echo "----------------------------------------------------"
        exit 0
    fi
    echo "   ...waiting for collector ($((COUNT+1))/$MAX_RETRIES)"
    sleep 2
    COUNT=$((COUNT+1))
done

echo "⚠️  Timeout: Containers are up, but Collector isn't responding yet."
echo "Check logs with: docker-compose logs -f otel-collector"
exit 1