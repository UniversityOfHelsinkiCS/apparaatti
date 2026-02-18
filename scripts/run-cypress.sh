#!/bin/sh
set -e

cleanup() {
	echo "Stopping Docker Compose services..."
	docker compose down
}

trap cleanup EXIT INT TERM

echo "Starting Docker Compose services..."
docker compose up -d --build app db redis

echo "Waiting for app readiness at http://localhost:3000/api/ping..."
retries=60
until curl -fsS http://localhost:3000/api/ping >/dev/null 2>&1; do
	retries=$((retries - 1))
	if [ "$retries" -le 0 ]; then
		echo "App did not become ready in time"
		exit 1
	fi
	sleep 2
done

echo "Running Cypress tests..."
npx cypress run --spec cypress/e2e/ping.cy.ts
