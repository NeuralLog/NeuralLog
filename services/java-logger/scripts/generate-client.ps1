# Script to generate Java client code from Swagger specification
param (
    [string]$serverUrl = "http://localhost:3030",
    [string]$apiPackage = "com.neurallog.sdk.api",
    [string]$modelPackage = "com.neurallog.sdk.model",
    [string]$invokerPackage = "com.neurallog.sdk.client"
)

# Create temp directory for OpenAPI spec
$tempDir = Join-Path $PSScriptRoot "temp"
if (-not (Test-Path $tempDir)) {
    New-Item -ItemType Directory -Path $tempDir | Out-Null
}

# Download the Swagger specification
$swaggerSpecPath = Join-Path $tempDir "swagger.json"
Write-Host "Downloading Swagger specification from $serverUrl/swagger.json"
try {
    Invoke-WebRequest -Uri "$serverUrl/swagger.json" -OutFile $swaggerSpecPath
    Write-Host "Swagger specification downloaded successfully"
} catch {
    Write-Error "Failed to download Swagger specification: $_"
    exit 1
}

# Ensure the OpenAPI Generator CLI is available
$openApiGenVersion = "6.6.0"
$openApiGenJar = Join-Path $tempDir "openapi-generator-cli-$openApiGenVersion.jar"

if (-not (Test-Path $openApiGenJar)) {
    Write-Host "Downloading OpenAPI Generator CLI..."
    $openApiGenUrl = "https://repo1.maven.org/maven2/org/openapitools/openapi-generator-cli/$openApiGenVersion/openapi-generator-cli-$openApiGenVersion.jar"
    try {
        Invoke-WebRequest -Uri $openApiGenUrl -OutFile $openApiGenJar
        Write-Host "OpenAPI Generator CLI downloaded successfully"
    } catch {
        Write-Error "Failed to download OpenAPI Generator CLI: $_"
        exit 1
    }
}

# Generate the Java client code
Write-Host "Generating Java client code..."
$projectRoot = (Get-Item $PSScriptRoot).Parent.FullName
$outputPath = Join-Path $projectRoot "target\generated-sources"

# Create config file for generation
$configFile = Join-Path $tempDir "config.json"
@{
    "library" = "native"
    "dateLibrary" = "java8"
    "hideGenerationTimestamp" = $true
    "serializationLibrary" = "jackson"
    "useBeanValidation" = $false
    "useRuntimeException" = $true
    "useJakartaEe" = $false
    "disableHtmlEscaping" = $true
    "annotationLibrary" = "none"
} | ConvertTo-Json | Set-Content $configFile

# Run the OpenAPI Generator
Write-Host "Running OpenAPI Generator with output path: $outputPath"
java -jar $openApiGenJar generate `
    -i $swaggerSpecPath `
    -g java `
    -o $outputPath `
    --api-package $apiPackage `
    --model-package $modelPackage `
    --invoker-package $invokerPackage `
    --config $configFile `
    --skip-validate-spec `
    --verbose

if ($LASTEXITCODE -eq 0) {
    Write-Host "Java client code generated successfully in $outputPath"
} else {
    Write-Error "Failed to generate Java client code"
    exit 1
}

# Clean up temporary files but keep the JAR for future use
Remove-Item $swaggerSpecPath -Force
Remove-Item $configFile -Force

# Copy the generated files to the main source directory
$srcDir = Join-Path $outputPath "src\main\java"
$destDir = Join-Path $projectRoot "src\main\java"

Write-Host "Copying generated files to $destDir"
if (Test-Path $srcDir) {
    # Create destination directories if they don't exist
    $apiDestDir = Join-Path $destDir $apiPackage.Replace('.', '\')
    $modelDestDir = Join-Path $destDir $modelPackage.Replace('.', '\')
    $clientDestDir = Join-Path $destDir $invokerPackage.Replace('.', '\')

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
    $apiSrcDir = Join-Path $srcDir $apiPackage.Replace('.', '\')
    if (Test-Path $apiSrcDir) {
        Write-Host "Copying API classes..."
        Copy-Item -Path "$apiSrcDir\*.java" -Destination $apiDestDir -Force
    }

    # Copy model classes
    $modelSrcDir = Join-Path $srcDir $modelPackage.Replace('.', '\')
    if (Test-Path $modelSrcDir) {
        Write-Host "Copying model classes..."
        Copy-Item -Path "$modelSrcDir\*.java" -Destination $modelDestDir -Force
    }

    # Copy client classes
    $clientSrcDir = Join-Path $srcDir $invokerPackage.Replace('.', '\')
    if (Test-Path $clientSrcDir) {
        Write-Host "Copying client classes..."
        Copy-Item -Path "$clientSrcDir\*.java" -Destination $clientDestDir -Force

        # Copy client auth classes
        $clientAuthSrcDir = Join-Path $clientSrcDir "auth"
        $clientAuthDestDir = Join-Path $clientDestDir "auth"
        if (Test-Path $clientAuthSrcDir) {
            if (-not (Test-Path $clientAuthDestDir)) {
                New-Item -ItemType Directory -Path $clientAuthDestDir -Force | Out-Null
            }
            Copy-Item -Path "$clientAuthSrcDir\*.java" -Destination $clientAuthDestDir -Force
        }
    }
}

Write-Host "Client generation completed successfully"
