# Copy generated API client code to the main source directory

# Define source and destination directories
$sourceDir = Join-Path $PSScriptRoot "..\src\main\java\src\main\java\com\neurallog\sdk"
$destDir = Join-Path $PSScriptRoot "..\src\main\java\com\neurallog\sdk"

# Create destination directories if they don't exist
$apiDestDir = Join-Path $destDir "api"
$modelDestDir = Join-Path $destDir "model"
$clientDestDir = Join-Path $destDir "client"

if (-not (Test-Path $apiDestDir)) {
    New-Item -ItemType Directory -Path $apiDestDir -Force | Out-Null
}

if (-not (Test-Path $modelDestDir)) {
    New-Item -ItemType Directory -Path $modelDestDir -Force | Out-Null
}

if (-not (Test-Path $clientDestDir)) {
    New-Item -ItemType Directory -Path $clientDestDir -Force | Out-Null
}

# Copy API classes
Write-Host "Copying API classes..."
Copy-Item -Path (Join-Path $sourceDir "api\*.java") -Destination $apiDestDir -Force

# Copy model classes
Write-Host "Copying model classes..."
Copy-Item -Path (Join-Path $sourceDir "model\*.java") -Destination $modelDestDir -Force

# Copy client classes
Write-Host "Copying client classes..."
Copy-Item -Path (Join-Path $sourceDir "client\*.java") -Destination $clientDestDir -Force

# Copy client auth classes
$clientAuthDestDir = Join-Path $clientDestDir "auth"
if (-not (Test-Path $clientAuthDestDir)) {
    New-Item -ItemType Directory -Path $clientAuthDestDir -Force | Out-Null
}
Copy-Item -Path (Join-Path $sourceDir "client\auth\*.java") -Destination $clientAuthDestDir -Force

Write-Host "Code copying completed successfully!"
