# PowerShell Build Script for generic-ecommerce environment

Write-Host "Starting Optimized Build Process..." -ForegroundColor Cyan

# Set NODE_OPTIONS to increase memory limit for the build process
# 8192MB = 8GB. Adjust if necessary based on available system memory.
$env:NODE_OPTIONS = "--max-old-space-size=8192"

Write-Host "Memory limit set to 8GB ($env:NODE_OPTIONS)" -ForegroundColor Gray

# Check if node_modules exists, if not, recommend install
if (-not (Test-Path "node_modules")) {
    Write-Warning "node_modules not found. You might need to run 'npm install' first."
}

# Execute the vite build
Write-Host "Running Vite Build..." -ForegroundColor Cyan
try {
    # Using npx to ensure we use the local vite version
    # execute command and capture exit code
    $process = Start-Process -FilePath "npx.cmd" -ArgumentList "vite", "build" -PassThru -NoNewWindow -Wait
    
    if ($process.ExitCode -eq 0) {
        Write-Host "Build Completed Successfully!" -ForegroundColor Green
    } else {
        Write-Error "Build Failed with exit code $($process.ExitCode)"
    }
} catch {
    Write-Error "An unexpected error occurred: $_"
}
