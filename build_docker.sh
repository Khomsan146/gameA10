#!/bin/bash
echo "Building Party Card Game v1.0..."

# Build and tag server
echo "Building Server..."
docker build -t party-card-game-server:1.0 ./server

# Build and tag client
echo "Building Client..."
docker build -t party-card-game-client:1.0 ./client

echo "Build Complete!"
echo "Images created:"
echo " - party-card-game-server:1.0"
echo " - party-card-game-client:1.0"
