#!/bin/bash

PROJECT_NAME="CabanApp"
FRONTEND_URL="http://localhost:3000"

echo "Setup and start script for $PROJECT_NAME"

echo "Installing backend dependencies..."
cd server || exit
npm install

echo "Starting backend..."
npm run dev &
SERVER_PID=$!
cd ..

echo "Installing frontend dependencies..."
cd client || exit
npm install

echo "Starting frontend..."
npm run dev &
CLIENT_PID=$!

sleep 5
echo "Opening frontend in browser: $FRONTEND_URL"

if command -v xdg-open >/dev/null; then
  xdg-open "$FRONTEND_URL"
elif command -v open >/dev/null; then
  open "$FRONTEND_URL"
elif command -v start >/dev/null; then
  start "$FRONTEND_URL"
else
  echo "Please open manually: $FRONTEND_URL"
fi

echo "$PROJECT_NAME is running."
echo "Backend: http://localhost:5000"
echo "Frontend: $FRONTEND_URL"

wait $SERVER_PID $CLIENT_PID
