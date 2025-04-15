#!/bin/bash

# Script to generate a new CSR for a service

# Check if required arguments are provided
if [ $# -lt 3 ]; then
  echo "Usage: $0 <service> <environment> <domain>"
  echo "Example: $0 NI-API PROD api-gateway.ksa.ngenius-payments.com"
  exit 1
fi

SERVICE=$1
ENV=$2
DOMAIN=$3

# Convert service name to lowercase for filename
SERVICE_LOWER=$(echo "$SERVICE" | tr '[:upper:]' '[:lower:]')

# Set target directory based on environment
if [ "$ENV" == "PROD" ]; then
  TARGET_DIR="../Prod-CSR/$SERVICE"
  KEY_FILE="$TARGET_DIR/saudi-$SERVICE_LOWER-prod.key"
  CSR_FILE="$TARGET_DIR/saudi-$SERVICE_LOWER-prod-csr.csr"
elif [ "$ENV" == "UAT" ]; then
  TARGET_DIR="../UAT-CSR/$SERVICE"
  KEY_FILE="$TARGET_DIR/saudi-$SERVICE_LOWER-uat.key"
  CSR_FILE="$TARGET_DIR/saudi-$SERVICE_LOWER-uat-csr.csr"
else
  echo "Error: Environment must be either PROD or UAT"
  exit 1
fi

# Create target directory if it doesn't exist
mkdir -p "$TARGET_DIR"

echo "Generating CSR for $SERVICE in $ENV environment"
echo "Domain: $DOMAIN"

# Generate private key
openssl genrsa -out "$KEY_FILE" 2048
echo "Generated private key: $KEY_FILE"

# Generate CSR
openssl req -new -key "$KEY_FILE" -out "$CSR_FILE" -subj "/C=SA/O=Network International Arabia Limited Co./CN=$DOMAIN"
echo "Generated CSR: $CSR_FILE"

# Verify CSR
echo ""
echo "CSR Details:"
openssl req -in "$CSR_FILE" -noout -text | grep "Subject:"

echo ""
echo "CSR generation complete!"
echo "Run ./scripts/generate_csr_report.sh to update the CSR report"
