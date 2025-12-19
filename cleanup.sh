#!/bin/bash

#Part 1
echo "🛑 Stopping all containers and removing volumes..."
docker compose down -v --remove-orphans

echo "🧹 Cleaning up local bind-mount directories..."
# This handles the folders created on your host machine
rm -rf ./loki-data
rm -rf ./prometheus-data

echo "💎 Deep cleaning Docker cache (Optional)..."
# Removes unused images to save even more GBs
docker image prune -f

echo "✅ System is clean. Local space recovered."


#Part # 2
# echo "⚠️  WARNING: This will delete ALL logs, metrics, and traces."
# read -p "Are you sure? (y/n) " -n 1 -r
# echo
# if [[ $REPLY =~ ^[Yy]$ ]]
# then
#     docker compose down -v --remove-orphans
#     # Clean up local bind-mount folders if they exist
#     rm -rf ./loki-data
#     rm -rf ./prometheus-data
#     docker volume prune -f
#     echo "✅ Workspace cleaned."
fi