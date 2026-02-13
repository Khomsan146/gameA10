Write-Host "Building Party Card Game v1.1..."

# Build and tag server
Write-Host "Building Server..."
docker build -t party-card-game-server:1.1 ./server

# Build and tag client
Write-Host "Building Client..."
docker build -t party-card-game-client:1.1 ./client

Write-Host "Build Complete!"
Write-Host "Images created:"
Write-Host " - party-card-game-server:1.1"
Write-Host " - party-card-game-client:1.1"
