# Setup Windows Firewall for Next.js Dev Server
# Run this script as Administrator

Write-Host "Setting up Windows Firewall rule for Next.js Dev Server (Port 3001)..." -ForegroundColor Cyan

try {
    # Check if rule already exists
    $existingRule = Get-NetFirewallRule -DisplayName "Next.js Dev Server Port 3001" -ErrorAction SilentlyContinue

    if ($existingRule) {
        Write-Host "Rule already exists. Removing old rule..." -ForegroundColor Yellow
        Remove-NetFirewallRule -DisplayName "Next.js Dev Server Port 3001"
    }

    # Add new firewall rule
    New-NetFirewallRule -DisplayName "Next.js Dev Server Port 3001" `
                        -Direction Inbound `
                        -Action Allow `
                        -Protocol TCP `
                        -LocalPort 3001 `
                        -Profile Any

    Write-Host "Firewall rule added successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your Next.js server should now be accessible from:" -ForegroundColor Cyan
    Write-Host "  Local:   http://localhost:3001" -ForegroundColor White
    Write-Host "  Network: http://192.168.1.5:3001" -ForegroundColor White
    Write-Host ""
    Write-Host "Run 'npm run dev' to start the server with network access." -ForegroundColor Yellow

} catch {
    Write-Host "Failed to add firewall rule: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure you are running PowerShell as Administrator!" -ForegroundColor Yellow
    Write-Host "Right-click PowerShell and select Run as Administrator" -ForegroundColor Yellow
    exit 1
}
