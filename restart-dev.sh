#!/bin/bash

# restart-dev.sh
# A script to fully restart the Node.js dev server and clear common caches
# This helps ensure code changes (especially Mongoose schema fixes) are picked up.

set -e  # Exit on any error

echo "=== Stopping any running dev server ==="
# Kill any process using the common dev ports (3000, 5000, 8000, etc.) or nodemon/ts-node-dev
pkill -f "node.*(nodemon|ts-node-dev)" || true
pkill -f "next.*dev" || true  # if you're using Next.js
pkill -f "vite" || true       # if using Vite
# Common ports - adjust if your app uses a different one
lsof -i :3000 -t | xargs kill -9 || true
lsof -i :5000 -t | xargs kill -9 || true
lsof -i :8000 -t | xargs kill -9 || true
lsof -i :8080 -t | xargs kill -9 || true

echo "=== Clearing common caches ==="
# nodemon cache
rm -rf .nodemon_cache || true
# ts-node/ts-node-dev cache
rm -rf .ts-node || true
# General node_modules cache folders (some tools use these)
rm -rf node_modules/.cache || true
# Next.js cache (if applicable)
rm -rf .next || true
# Vite cache (if applicable)
rm -rf node_modules/.vite || true

echo "=== Installing dependencies (just in case) ==="
# Optional but harmless - ensures no stale symlinks
npm install || yarn install || pnpm install || echo "No package manager install step ran"

echo "=== Starting the dev server ==="
# Replace this with your actual dev command
# Common examples - uncomment the one you use:
npm run dev
# yarn dev
# pnpm dev
# npm run start:dev

# If you use something custom, replace the line above with:
# node server.js
# or whatever your start command is

