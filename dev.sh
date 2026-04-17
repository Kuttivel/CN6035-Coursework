#!/bin/bash

# ========================================
# Blockchain Dev Environment Script
# ========================================

# Function to stop all child processes
cleanup() {
    echo -e "\nStopping all processes..."
    
    # Kill background processes if they exist
    [ ! -z "$HARDHAT_PID" ] && kill $HARDHAT_PID
    [ ! -z "$BACKEND_PID" ] && kill $BACKEND_PID
    [ ! -z "$FRONTEND_PID" ] && kill $FRONTEND_PID

    # Stop Redis and MongoDB
    echo "Stopping Redis and MongoDB..."
    sudo service redis-server stop
    sudo pkill mongod

    echo "All processes stopped."
    exit 0
}

# Trap Ctrl + C
trap cleanup INT

# 🟢 Start Redis
echo "Starting Redis..."
sudo service redis-server start
if [ $? -ne 0 ]; then
    echo "Failed to start Redis. Exiting."
    exit 1
fi

# 🟢 Start MongoDB
echo "Starting MongoDB..."
sudo mongod --fork --logpath /var/log/mongod.log
if [ $? -ne 0 ]; then
    echo "Failed to start MongoDB. Exiting."
    exit 1
fi

# 🟢 Start Hardhat Node (background)
echo "Starting Hardhat node..."
cd ./contracts || exit
npx hardhat node &
HARDHAT_PID=$!
cd - > /dev/null

# Give Hardhat node a few seconds to start
sleep 5

# 🟢 Deploy contracts
echo "Deploying contracts..."
cd ./contracts || exit
npx hardhat ignition deploy ./ignition/modules/MarketPlace.ts --network localhost
cd - > /dev/null

# 🟢 Mint tokens
echo "Minting tokens..."
cd ./contracts || exit
npx hardhat run ./scripts/mintMNEE.ts
cd - > /dev/null

# 🟢 Start backend (background)
echo "Starting backend server..."
cd ./backend || exit
npm run dev &
BACKEND_PID=$!
cd - > /dev/null

# 🟢 Start frontend (background)
echo "Starting frontend server..."
cd ./frontend || exit
npm run dev &
FRONTEND_PID=$!
cd - > /dev/null

echo -e "\nAll services started successfully!"
echo "Hardhat PID: $HARDHAT_PID | Backend PID: $BACKEND_PID | Frontend PID: $FRONTEND_PID"
echo "Press Ctrl + C to stop everything."

# Keep the script alive so background processes stay running
wait
