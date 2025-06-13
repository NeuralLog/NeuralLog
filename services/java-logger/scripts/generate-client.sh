#!/bin/bash
# Script to generate Java client code from Swagger specification

# Default parameters
SERVER_URL=${1:-"http://localhost:3030"}
OUTPUT_DIR=${2:-"../src/main/java"}
API_PACKAGE=${3:-"com.neurallog.sdk.api"}
MODEL_PACKAGE=${4:-"com.neurallog.sdk.model"}
INVOKER_PACKAGE=${5:-"com.neurallog.sdk.client"}

# Create temp directory for OpenAPI spec
TEMP_DIR="$(dirname "$0")/temp"
mkdir -p "$TEMP_DIR"

# Download the Swagger specification
SWAGGER_SPEC_PATH="$TEMP_DIR/swagger.json"
echo "Downloading Swagger specification from $SERVER_URL/swagger.json"
if ! curl -s -o "$SWAGGER_SPEC_PATH" "$SERVER_URL/swagger.json"; then
    echo "Failed to download Swagger specification"
    exit 1
fi
echo "Swagger specification downloaded successfully"

# Ensure the OpenAPI Generator CLI is available
OPENAPI_GEN_VERSION="6.6.0"
OPENAPI_GEN_JAR="$TEMP_DIR/openapi-generator-cli-$OPENAPI_GEN_VERSION.jar"

if [ ! -f "$OPENAPI_GEN_JAR" ]; then
    echo "Downloading OpenAPI Generator CLI..."
    OPENAPI_GEN_URL="https://repo1.maven.org/maven2/org/openapitools/openapi-generator-cli/$OPENAPI_GEN_VERSION/openapi-generator-cli-$OPENAPI_GEN_VERSION.jar"
    if ! curl -s -o "$OPENAPI_GEN_JAR" "$OPENAPI_GEN_URL"; then
        echo "Failed to download OpenAPI Generator CLI"
        exit 1
    fi
    echo "OpenAPI Generator CLI downloaded successfully"
fi

# Generate the Java client code
echo "Generating Java client code..."
OUTPUT_PATH="$(dirname "$0")/$OUTPUT_DIR"

# Create config file for generation
CONFIG_FILE="$TEMP_DIR/config.json"
cat > "$CONFIG_FILE" << EOF
{
  "library": "jersey3",
  "dateLibrary": "java8",
  "hideGenerationTimestamp": true,
  "serializationLibrary": "jackson",
  "useBeanValidation": true,
  "useRuntimeException": true,
  "useJakartaEe": true
}
EOF

# Run the OpenAPI Generator
java -jar "$OPENAPI_GEN_JAR" generate \
    -i "$SWAGGER_SPEC_PATH" \
    -g java \
    -o "$OUTPUT_PATH" \
    --api-package "$API_PACKAGE" \
    --model-package "$MODEL_PACKAGE" \
    --invoker-package "$INVOKER_PACKAGE" \
    --config "$CONFIG_FILE" \
    --skip-validate-spec

if [ $? -eq 0 ]; then
    echo "Java client code generated successfully in $OUTPUT_PATH"
else
    echo "Failed to generate Java client code"
    exit 1
fi

# Clean up temporary files but keep the JAR for future use
rm "$SWAGGER_SPEC_PATH"
rm "$CONFIG_FILE"

echo "Client generation completed successfully"
