#!/bin/bash
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "🚀 Starting Observability Stack Smoke Test..."

check() {
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$2")
    echo -n "Checking $1... "
    if [[ "$STATUS" == "200" || "$STATUS" == "302" ]]; then
        echo -e "${GREEN}UP ($STATUS)${NC}"
    else
        echo -e "${RED}DOWN ($STATUS)${NC}"
    fi
}

check "Grafana  " "http://localhost:3000/api/health"
check "Prometheus" "http://localhost:9090/-/healthy"
check "Loki      " "http://localhost:3100/ready"
check "Tempo     " "http://localhost:3200/ready"
check "OTel      " "http://localhost:13133/"

echo "🏁 Test complete."