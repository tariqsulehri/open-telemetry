#!/bin/bash

# Simple deploy script to start services 1..5 without logs.
# Each service runs in background from the same directory and receives a descriptive
# SERVICE_NAME environment variable. Output is discarded (/dev/null).

# 1. User service
start_service "1_user_service.js" "ecom.user.service"

# 2. Inventory service
start_service "2_inventory_service.js" "ecom.inventory.service"

# 3. Order service
start_service "3_order_service.js" "ecom.order.service"

# 4. Payment gateway (external-facing)
start_service "4_payment_service.js" "ecom.payment.gateway"

# 5. Payment processor / worker
start_service "5_payment_service.js" "ecom.payment.processor"

echo "All requested services started (if files existed)."
