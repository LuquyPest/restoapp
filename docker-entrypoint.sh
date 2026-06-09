#!/bin/sh
set -e

echo "Applying database schema..."
./node_modules/.bin/prisma db push --skip-generate

echo "Starting Next.js..."
exec node server.js
