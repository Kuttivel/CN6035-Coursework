# ========================================
# Blockchain Dev Environment Script
# ========================================

# Variables to track processes
$HARDHAT_PROCESS = $null
$BACKEND_PROCESS = $null
$FRONTEND_PROCESS = $null

# Function to cleanup on exit
function Cleanup {
    Write-Host ""
    Write-Host "Stopping all processes..."
    
    # Kill background processes if they exist
    if ($HARDHAT_PROCESS) {
        try {
            Stop-Process -Id $HARDHAT_PROCESS.Id -Force -ErrorAction SilentlyContinue
        } catch {}
    }
    
    if ($BACKEND_PROCESS) {
        try {
            Stop-Process -Id $BACKEND_PROCESS.Id -Force -ErrorAction SilentlyContinue
        } catch {}
    }
    
    if ($FRONTEND_PROCESS) {
        try {
            Stop-Process -Id $FRONTEND_PROCESS.Id -Force -ErrorAction SilentlyContinue
        } catch {}
    }
    
    Write-Host "All processes stopped."
    exit 0
}

# Trap Ctrl + C
$null = Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action { Cleanup }

# Start Hardhat Node (background)
Write-Host "Starting Hardhat node..."
Push-Location .\contracts
$HARDHAT_PROCESS = Start-Process -FilePath "cmd" -ArgumentList "/c npx hardhat node" -PassThru -WindowStyle Normal
Pop-Location

# Give Hardhat node a few seconds to start
Start-Sleep -Seconds 5

# Deploy contracts
Write-Host "Deploying contracts..."
Push-Location .\contracts
& npx hardhat ignition deploy .\ignition\modules\MarketPlace.ts --network localhost
Pop-Location

# Mint tokens
Write-Host "Minting tokens..."
Push-Location .\contracts
& npx hardhat run .\scripts\mintMNEE.ts
Pop-Location

# Start backend (background)
Write-Host "Starting backend server..."
Push-Location .\backend
$BACKEND_PROCESS = Start-Process -FilePath "cmd" -ArgumentList "/c npm run dev" -PassThru -WindowStyle Normal
Pop-Location

# Start frontend (background)
Write-Host "Starting frontend server..."
Push-Location .\frontend
$FRONTEND_PROCESS = Start-Process -FilePath "cmd" -ArgumentList "/c npm run dev" -PassThru -WindowStyle Normal
Pop-Location

Write-Host ""
Write-Host "All services started successfully!"
Write-Host "Hardhat PID: $($HARDHAT_PROCESS.Id) | Backend PID: $($BACKEND_PROCESS.Id) | Frontend PID: $($FRONTEND_PROCESS.Id)"
Write-Host "Press Ctrl + C to stop everything."

# Keep the script running
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} catch {
    Cleanup
}
