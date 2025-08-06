#!/bin/bash

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 10

# Run database migrations/seed if needed
echo "Starting application..."
npm run start:prod