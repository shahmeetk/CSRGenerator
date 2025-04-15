# CSR Management Scripts

This folder contains utility scripts for managing Certificate Signing Requests (CSRs).

## Available Scripts

### Core Scripts

- `generate_new_csr.sh` - Creates a new CSR for a specified service and environment
- `generate_csr_report.sh` - Generates a detailed report of all CSRs in the repository
- `verify_csrs.sh` - Displays details of all CSRs in the folder structure

### Additional Scripts

- `generate_final_report.sh` - Alternative report generator with more detailed output

## Usage

### Generate a New CSR

```bash
./generate_new_csr.sh <service> <environment> <domain>
```

Example:
```bash
./generate_new_csr.sh NI-API PROD api-gateway.ksa.ngenius-payments.com
```

### Generate CSR Report

```bash
./generate_csr_report.sh
```

This will create a `csr_report.md` file in the root directory with details of all CSRs.

### Verify CSRs

```bash
./verify_csrs.sh
```

This will display details of all CSRs in the terminal.

## Script Descriptions

### generate_new_csr.sh

This script generates a new CSR for a specified service and environment. It:
- Creates the necessary directory structure
- Generates a 2048-bit RSA private key
- Creates a CSR with the specified domain
- Verifies the CSR

### generate_csr_report.sh

This script generates a detailed report of all CSRs in the repository. It:
- Lists all Production CSRs with their details
- Lists all UAT CSRs with their details
- Provides a summary of the total number of CSRs

### verify_csrs.sh

This script displays details of all CSRs in the terminal. It:
- Shows the domain name for each CSR
- Groups CSRs by service and environment
- Provides a quick way to verify CSR information

### generate_final_report.sh

This script is an alternative report generator that provides more detailed output. It:
- Creates a more comprehensive report with additional details
- Formats the output in Markdown for easy reading
