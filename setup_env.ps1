# Setup Development Environment
# Run this script in PowerShell as Administrator to install necessary tools.

Write-Host "Installing Node.js (LTS)..."
winget install -e --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements

Write-Host "Installing VS Code..."
winget install -e --id Microsoft.VisualStudioCode --accept-source-agreements --accept-package-agreements

Write-Host "Installing Git..."
winget install -e --id Git.Git --accept-source-agreements --accept-package-agreements

Write-Host "Installation Complete! Please restart your terminal."
