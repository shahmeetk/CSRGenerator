#!/bin/bash

# Script to verify all CSRs in the folder structure

echo "CSR Verification Report"
echo "======================="
echo ""

# Process each service directory in Prod-CSR
echo "Production CSRs:"
echo "---------------"
for service_dir in ../Prod-CSR/*; do
  if [ -d "$service_dir" ]; then
    service=$(basename "$service_dir")
    echo "Service: $service"

    # Check CSRs
    for csr_file in "$service_dir"/*.csr; do
      if [ -f "$csr_file" ]; then
        domain=$(openssl req -in "$csr_file" -noout -text | grep "Subject:" | grep -o "CN=[^,]*" | sed 's/CN=//')
        echo "  - File: $(basename "$csr_file")"
        echo "    Domain: $domain"
      fi
    done
    echo ""
  fi
done

echo ""

# Process each service directory in UAT-CSR
echo "UAT CSRs:"
echo "---------"
for service_dir in ../UAT-CSR/*; do
  if [ -d "$service_dir" ]; then
    service=$(basename "$service_dir")
    echo "Service: $service"

    # Check CSRs
    for csr_file in "$service_dir"/*.csr; do
      if [ -f "$csr_file" ]; then
        domain=$(openssl req -in "$csr_file" -noout -text | grep "Subject:" | grep -o "CN=[^,]*" | sed 's/CN=//')
        echo "  - File: $(basename "$csr_file")"
        echo "    Domain: $domain"
      fi
    done
    echo ""
  fi
done

echo "Verification complete!"
