#!/bin/bash

# --- Configuration ---
PROJECT_NAME="otel-observability"
DATA_DIR="./otel-storage" # Change this to your local persistence path

echo "🚀 Starting Observability Stack Cleanup..."

# 1. Stop and remove containers, networks, and images defined in the compose file
if [ -f "docker-compose.yml" ]; then
    echo "📦 Stopping Docker containers and removing networks..."
    docker-compose down --remove-orphans
else
    echo "⚠️  docker-compose.yml not found. Skipping container teardown."
fi

# 2. Remove local persistent volumes (Metrics, health-checks, etc.)
if [ -d "$DATA_DIR" ]; then
    echo "🧹 Removing local data directory: $DATA_DIR"
    # Using sudo because OTel collector often writes as root/service user
    sudo rm -rf "$DATA_DIR"
else
    echo "ℹ️  Local data directory already clean."
fi

# 3. Clean up dangling OTel/Grafana Docker volumes
echo "🧹 Pruning unused Docker volumes..."
docker volume prune -f --filter "label=com.docker.compose.project=$PROJECT_NAME"

# 4. Optional: Remove the OTel instrumentation logs if they exist
if [ -f "otel-debug.log" ]; then
    rm otel-debug.log
    echo "📄 Removed debug logs."
fi

echo "✅ Cleanup complete. Your environment is now in a 'Fresh Start' state."
echo "💡 Note: Data stored in AWS S3 buckets was NOT deleted."