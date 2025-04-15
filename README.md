# CSR Generator Tool

A Certificate Signing Request (CSR) management tool for security professionals, system administrators, and DevOps engineers. This tool simplifies the process of generating and validating CSRs for SSL certificates.

## 💡 Project Idea

The CSR Generator Tool was created to address the challenges faced by security teams and system administrators when managing SSL certificates across multiple environments. The tool provides an intuitive interface for generating and validating Certificate Signing Requests (CSRs), which are essential for obtaining SSL certificates from Certificate Authorities (CAs).

Key problems it solves:

- Eliminates manual errors in CSR generation
- Provides domain name suggestions based on service and environment
- Validates CSRs against security best practices
- Offers a consistent workflow across different environments

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

## Features

- **CSR Generation**: Create CSRs for different services and environments
- **CSR Validation**: Validate existing CSRs for correctness

## Technology Stack

- **Frontend**: React.js with Material-UI
- **Backend**: JavaScript (Cloudflare Workers)
- **Alternative**: Streamlit Python app (all-in-one solution)
- **Hosting Options**:
  - GitHub Pages for frontend (completely free)
  - Cloudflare Workers for backend (free tier with generous limits)
  - Streamlit Community Cloud for the Streamlit app (completely free)

## Running Locally

To run the application locally, follow the instructions in the "Getting Started" section below. The application will be available at:

- Frontend: [http://localhost:3001](http://localhost:3001)
- Backend API: [http://localhost:8000](http://localhost:8000)

## Use Cases

### For Security Teams

- Generate CSRs following security best practices
- Validate CSRs against security policies

### For System Administrators

- Quickly generate CSRs for multiple services
- Ensure consistency across development, testing, and production environments

### For DevOps Engineers

- Integrate CSR generation into CI/CD pipelines
- Validate CSRs as part of your workflow

## Getting Started

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

This will start both the frontend and backend servers. The frontend will be available at [http://localhost:3001](http://localhost:3001) and the backend at [http://localhost:8000](http://localhost:8000).

**Step 4:** Run the tests:

```bash
./run_tests.sh
```

## API Endpoints

Once the backend is running, you can access the following API endpoints:

- Health Check: [http://localhost:8000/health](http://localhost:8000/health)
- Generate CSR: [http://localhost:8000/generate](http://localhost:8000/generate) (POST)
- Validate CSR: [http://localhost:8000/validate](http://localhost:8000/validate) (POST)

## Deployment

The application is deployed using completely free hosting options that don't require payment details:

### Option 1: Run Locally

```bash
# Clone the repository
git clone https://github.com/shahmeetk/CSRGenerator.git
cd CSRGenerator

# Run the frontend
cd frontend
npm install
npm start

# In a separate terminal, run the backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

This will start both the frontend and backend servers:

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:8000](http://localhost:8000)

### Option 2: Deploy to GitHub Pages and Cloudflare Workers (Free Hosting)

1. Deploy the frontend to GitHub Pages:

   ```bash
   cd frontend
   npm install
   npm run deploy
   ```

   This will deploy the frontend to `https://yourusername.github.io/CSRGenerator`

2. Deploy the backend to Cloudflare Workers:

   ```bash
   # Install Wrangler CLI if you haven't already
   npm install -g wrangler

   # Login to Cloudflare
   wrangler login

   # Deploy the worker
   cd cloudflare-worker
   wrangler publish
   ```

   This will deploy the backend to `https://csr-generator-api.yourusername.workers.dev`

3. Update the API URL in the frontend:
   - Create a `.env` file in the frontend directory with:

   ```env
   REACT_APP_API_URL=https://csr-generator-api.yourusername.workers.dev
   ```

   - Redeploy the frontend with `npm run deploy`

### Option 3: Deploy to Streamlit Community Cloud (Completely Free)

Streamlit Community Cloud offers free hosting without requiring payment details:

1. Create an account on [Streamlit Community Cloud](https://streamlit.io/cloud)

2. Connect your GitHub repository

3. Select the `streamlit_deployment.py` file as the main file

4. Deploy the app

This will deploy the Streamlit app to `https://yourusername-csrgenerator.streamlit.app`

## Examples for Each Functionality

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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [OpenSSL](https://www.openssl.org/)
- [React](https://reactjs.org/)
- [Material-UI](https://mui.com/)
- [Flask](https://flask.palletsprojects.com/)
