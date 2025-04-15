# CSR Generator Tool

A Certificate Signing Request (CSR) management tool for security professionals, system administrators, and DevOps engineers.

![CSR Generator Tool](https://img.shields.io/badge/CSR%20Generator-Tool-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Flask](https://img.shields.io/badge/Flask-2.0.1-green)

## Why Use CSR Generator Tool?

Managing Certificate Signing Requests (CSRs) across multiple environments and services can be challenging and error-prone. The CSR Generator Tool simplifies this process with an intuitive interface and useful features:

- **Save Time**: Generate and validate CSRs in seconds instead of minutes
- **Reduce Errors**: Validations prevent common mistakes
- **Enhance Security**: Built-in validation ensures your CSRs follow best practices
- **Flexible Deployment**: Easy to deploy and use

## 🌟 Features

- **CSR Generation**: Create CSRs for different services and environments
- **CSR Validation**: Validate existing CSRs for correctness

## 🛠️ Technology Stack

- **Frontend**: React.js with Material-UI
- **Backend**: Python (Flask)
- **Hosting Options**:
  - Any static hosting for frontend
  - Any Python hosting for backend

## 🚀 Running Locally

To run the application locally, follow the instructions in the "Getting Started" section below.

## 💻 Use Cases

### For Security Teams

- Generate CSRs following security best practices
- Validate CSRs against security policies

### For System Administrators

- Quickly generate CSRs for multiple services
- Ensure consistency across development, testing, and production environments

### For DevOps Engineers

- Integrate CSR generation into CI/CD pipelines
- Validate CSRs as part of your workflow

## 📋 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- npm or yarn
- bash (for running the scripts)

### 🔧 Installation

**Step 1:** Clone the repository:

```bash
git clone https://github.com/yourusername/CSRGenerator.git
cd CSRGenerator
```

**Step 2:** Make the scripts executable:

```bash
chmod +x run_local.sh run_tests.sh
```

**Step 3:** Run the application:

```bash
./run_local.sh
```

This will start both the frontend and backend servers.

**Step 4:** Run the tests:

```bash
./run_tests.sh
```

## 📝 API Endpoints

Once the backend is running, you can access the following API endpoints:

- Health Check: [http://localhost:8000/health](http://localhost:8000/health)
- Generate CSR: [http://localhost:8000/generate](http://localhost:8000/generate) (POST)
- Validate CSR: [http://localhost:8000/validate](http://localhost:8000/validate) (POST)

## 🚢 Deployment

You can deploy the application to any hosting service that supports React and Flask applications.

### Option 1: Run Locally

```bash
# Clone the repository
git clone https://github.com/yourusername/CSRGenerator.git
cd CSRGenerator

# Run the local development script
./run_local.sh
```

This will start both the frontend and backend servers:

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:8000](http://localhost:8000)

## 📖 Examples for Each Functionality

### 1. CSR Generation

1. Navigate to the "Generator" page
2. Select a service (e.g., "NI-3DS")
3. Select an environment (e.g., "PROD")
4. Fill in the organization details
5. Click "Generate CSR"
6. The CSR and private key will be displayed, with options to copy

### 2. CSR Validation

1. Navigate to the "Validator" page
2. Paste your CSR
3. Click "Validate CSR"
4. The validation results will show subject information, key size, and signature algorithm

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [OpenSSL](https://www.openssl.org/)
- [React](https://reactjs.org/)
- [Material-UI](https://mui.com/)
- [Flask](https://flask.palletsprojects.com/)
