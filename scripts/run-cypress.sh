#!/bin/sh
set -e

echo "Installing Cypress binary..."
npx cypress install


echo "Waiting for app"
npm wait-on http://host.docker.internal:3000

echo "Running Cypress tests..."
npx cypress run
