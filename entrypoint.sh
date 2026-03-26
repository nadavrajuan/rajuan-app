#!/bin/sh
set -e

echo "Running database migrations..."
# Use db push for initial setup; once migrations exist, switch to migrate deploy
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  node node_modules/prisma/build/index.js migrate deploy
else
  node node_modules/prisma/build/index.js db push --skip-generate
fi

echo "Starting server..."
exec node server.js
