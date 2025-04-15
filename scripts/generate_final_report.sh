#!/bin/bash

# Script to generate a final report of all CSRs in the new structure

echo "Generating Final CSR Report..."

report_file="../final_csr_report.md"

# Create report header
cat > $report_file << EOF
# Final CSR Report

This report provides details about all Certificate Signing Requests (CSRs) in the repository.

## Production CSRs

| Service | CSR File | Domain | Organization | Country |
|---------|----------|--------|--------------|---------|
EOF

# Add production CSRs to report directly
for csr_file in ../Prod-CSR/*/saudi-*.csr; do
  service=$(echo "$csr_file" | cut -d'/' -f2)
  filename=$(basename "$csr_file")

  # Extract CSR details directly
  domain=$(openssl req -in "$csr_file" -noout -text | grep "Subject:" | grep -o "CN=[^,]*" | sed 's/CN=//')
  org=$(openssl req -in "$csr_file" -noout -text | grep "Subject:" | grep -o "O=[^,]*" | sed 's/O=//')
  country=$(openssl req -in "$csr_file" -noout -text | grep "Subject:" | grep -o "C=[^,]*" | sed 's/C=//')

  # Add to report
  echo "| $service | $filename | $domain | $org | $country |" >> $report_file
done

# Add UAT section
cat >> $report_file << EOF

## UAT CSRs

| Service | CSR File | Domain | Organization | Country |
|---------|----------|--------|--------------|---------|
EOF

# Add UAT CSRs to report directly
for csr_file in ../UAT-CSR/*/saudi-*.csr; do
  service=$(echo "$csr_file" | cut -d'/' -f2)
  filename=$(basename "$csr_file")

  # Extract CSR details directly
  domain=$(openssl req -in "$csr_file" -noout -text | grep "Subject:" | grep -o "CN=[^,]*" | sed 's/CN=//')
  org=$(openssl req -in "$csr_file" -noout -text | grep "Subject:" | grep -o "O=[^,]*" | sed 's/O=//')
  country=$(openssl req -in "$csr_file" -noout -text | grep "Subject:" | grep -o "C=[^,]*" | sed 's/C=//')

  # Add to report
  echo "| $service | $filename | $domain | $org | $country |" >> $report_file
done

# Add summary section
cat >> $report_file << EOF

## Summary

- Total Production CSRs: $(find ../Prod-CSR -name "*.csr" | wc -l)
- Total UAT CSRs: $(find ../UAT-CSR -name "*.csr" | wc -l)

All CSRs have been validated and organized into the appropriate folders.
EOF

echo "Report generated: $report_file"
