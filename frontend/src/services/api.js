import axios from 'axios';

// API base URL - use environment variable or default to localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

console.log('API_BASE_URL:', API_BASE_URL);

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API service functions
const apiService = {
  // Health check
  healthCheck: async () => {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  },

  // Generate CSR
  generateCSR: async (csrData) => {
    try {
      const response = await apiClient.post('/generate', csrData);
      return response.data;
    } catch (error) {
      console.error('CSR generation failed:', error);
      throw error;
    }
  },

  // Validate CSR
  validateCSR: async (csrData) => {
    try {
      const response = await apiClient.post('/validate', { csr_data: csrData });
      return response.data;
    } catch (error) {
      console.error('CSR validation failed:', error);
      throw error;
    }
  }
};

export default apiService;
