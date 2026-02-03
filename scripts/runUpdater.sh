#!/bin/bash

# Script to manually trigger the updater
# Run this from the container terminal to force an updater run

echo "Triggering updater manually..."

# Trigger the updater via the API endpoint
curl -X POST http://localhost:3000/api/updater/run \
  -H "Content-Type: application/json"

echo ""
echo "Updater trigger request completed"
