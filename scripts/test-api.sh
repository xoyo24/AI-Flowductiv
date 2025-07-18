#!/bin/bash

# API Integration Test Runner
# This script starts the dev server and runs API integration tests

echo "🚀 Starting API Integration Tests..."

# Check if server is already running
if curl -s http://localhost:3000/api/activities/suggestions > /dev/null 2>&1; then
  echo "✅ Server is already running on port 3000"
  echo "🧪 Running integration tests..."
  bun test tests/api/activities/suggestions.integration.test.ts
else
  echo "🔄 Server not running. Starting development server..."
  
  # Start the dev server in background
  bun dev &
  SERVER_PID=$!
  
  echo "⏳ Waiting for server to start..."
  
  # Wait for server to be ready (max 30 seconds)
  for i in {1..30}; do
    if curl -s http://localhost:3000/api/activities/suggestions > /dev/null 2>&1; then
      echo "✅ Server is ready!"
      break
    fi
    
    if [ $i -eq 30 ]; then
      echo "❌ Server failed to start within 30 seconds"
      kill $SERVER_PID 2>/dev/null
      exit 1
    fi
    
    sleep 1
  done
  
  echo "🧪 Running integration tests..."
  
  # Run the integration tests
  bun test tests/api/activities/suggestions.integration.test.ts
  TEST_EXIT_CODE=$?
  
  echo "🛑 Stopping development server..."
  kill $SERVER_PID 2>/dev/null
  
  # Wait for server to stop
  sleep 2
  
  if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ All API integration tests passed!"
  else
    echo "❌ Some API integration tests failed"
    exit $TEST_EXIT_CODE
  fi
fi