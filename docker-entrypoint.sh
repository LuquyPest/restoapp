#!/bin/sh
set -e

echo "Applying database schema..."
node ./node_modules/prisma/build/index.js db push --skip-generate

echo "Creating admin user if needed..."
node ./create-admin.mjs

echo "Starting Next.js..."
exec node server.js
