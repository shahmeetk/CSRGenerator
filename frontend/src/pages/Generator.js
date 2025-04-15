import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Divider,
  Alert,
  Snackbar,
  FormHelperText,
  CircularProgress,
} from '@mui/material';

const Generator = () => {
  const [formData, setFormData] = useState({
    commonName: '',
    organization: 'Example Organization, Inc.',
    organizationalUnit: '',
    locality: '',
    state: '',
    country: 'US',
    email: '',
    keySize: 2048,
    service: '',
    environment: 'PROD',
  });

  const [result, setResult] = useState({
    csr: '',
    privateKey: '',
    loading: false,
    error: null,
    success: false,
  });

  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // AI suggestion for domain name when service and environment are selected
    if ((name === 'service' || name === 'environment') && formData.service) {
      const service = name === 'service' ? value : formData.service;
      const environment = name === 'environment' ? value : formData.environment;

      if (service && environment) {
        // In a real app, this would call an API
        const suggestedDomain = getSuggestedDomain(service, environment);
        setAiSuggestion({
          message: `Suggested domain name based on service and environment:`,
          value: suggestedDomain,
        });
      }
    }
  };

  const getSuggestedDomain = (service, environment) => {
    // This is a simplified version - in a real app, this would use AI
    const serviceDomains = {
      'WEB': 'www',
      'API': 'api',
      'ADMIN': 'admin',
      'PORTAL': 'portal',
      'APP': 'app',
    };

    const baseDomain = serviceDomains[service] || service.toLowerCase();

    if (environment === 'PROD') {
      return `${baseDomain}.example.com`;
    } else {
      return `${baseDomain}.${environment.toLowerCase()}.example.com`;
    }
  };

  // Check backend health on component mount
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        await apiService.healthCheck();
        console.log('Backend is healthy');
      } catch (error) {
        console.error('Backend health check failed:', error);
        setSnackbar({
          open: true,
          message: 'Warning: Backend service is not available',
          severity: 'warning',
        });
      }
    };

    checkBackendHealth();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult({ ...result, loading: true, error: null });

    try {
      // Prepare data for API call
      const csrData = {
        common_name: formData.commonName,
        organization: formData.organization,
        organizational_unit: formData.organizationalUnit,
        locality: formData.locality,
        state: formData.state,
        country: formData.country,
        email: formData.email,
        key_size: formData.keySize,
        service: formData.service,
        environment: formData.environment
      };

      // Call the API to generate CSR
      const response = await apiService.generateCSR(csrData);

      setResult({
        csr: response.csr,
        privateKey: response.private_key,
        loading: false,
        error: null,
        success: true,
      });

      setSnackbar({
        open: true,
        message: 'CSR generated successfully!',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error generating CSR:', error);
      setResult({
        ...result,
        loading: false,
        error: error.response?.data?.error || 'Error generating CSR. Please try again.',
        success: false,
      });

      setSnackbar({
        open: true,
        message: 'Error generating CSR',
        severity: 'error',
      });
    }
  };

  const handleUseSuggestion = () => {
    if (aiSuggestion) {
      setFormData({
        ...formData,
        commonName: aiSuggestion.value,
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setSnackbar({
      open: true,
      message: `${type} copied to clipboard!`,
      severity: 'success',
    });
  };

  return (
    <Container className="page-content">
      <Typography variant="h4" component="h1" gutterBottom>
        CSR Generator
      </Typography>
      <Typography variant="body1" paragraph>
        Generate Certificate Signing Requests (CSRs) for your services. Fill out the form below to create a new CSR.
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="service-label">Service</InputLabel>
                <Select
                  labelId="service-label"
                  id="service"
                  name="service"
                  value={formData.service}
                  label="Service"
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="WEB">Web</MenuItem>
                  <MenuItem value="API">API</MenuItem>
                  <MenuItem value="ADMIN">Admin</MenuItem>
                  <MenuItem value="PORTAL">Portal</MenuItem>
                  <MenuItem value="APP">App</MenuItem>
                  <MenuItem value="CUSTOM">Custom</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="environment-label">Environment</InputLabel>
                <Select
                  labelId="environment-label"
                  id="environment"
                  name="environment"
                  value={formData.environment}
                  label="Environment"
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="PROD">Production</MenuItem>
                  <MenuItem value="UAT">UAT</MenuItem>
                  <MenuItem value="DEV">Development</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Common Name (Domain)"
                name="commonName"
                value={formData.commonName}
                onChange={handleChange}
                required
                helperText="The fully qualified domain name (e.g., example.com)"
              />
              {aiSuggestion && (
                <Box className="ai-suggestion" sx={{ mt: 1 }}>
                  <Typography variant="body2">{aiSuggestion.message}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', mr: 2 }}>
                      {aiSuggestion.value}
                    </Typography>
                    <Button size="small" variant="outlined" onClick={handleUseSuggestion}>
                      Use Suggestion
                    </Button>
                  </Box>
                </Box>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Organization"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                required
                helperText="Your organization's legal name"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Organizational Unit"
                name="organizationalUnit"
                value={formData.organizationalUnit}
                onChange={handleChange}
                helperText="Department or division (optional)"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Locality (City)"
                name="locality"
                value={formData.locality}
                onChange={handleChange}
                helperText="City or locality"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="State/Province"
                name="state"
                value={formData.state}
                onChange={handleChange}
                helperText="State or province"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Country Code"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                helperText="Two-letter country code (e.g., US, GB, SA)"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                helperText="Contact email address (optional)"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="key-size-label">Key Size</InputLabel>
                <Select
                  labelId="key-size-label"
                  id="keySize"
                  name="keySize"
                  value={formData.keySize}
                  label="Key Size"
                  onChange={handleChange}
                  required
                >
                  <MenuItem value={2048}>2048 bits (Standard)</MenuItem>
                  <MenuItem value={4096}>4096 bits (Strong)</MenuItem>
                </Select>
                <FormHelperText>RSA key size in bits</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={result.loading}
                  sx={{ mt: 2 }}
                >
                  {result.loading ? <CircularProgress size={24} /> : 'Generate CSR'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {result.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {result.error}
        </Alert>
      )}

      {result.success && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Generated CSR
          </Typography>
          <Box className="code-block" sx={{ mb: 3 }}>
            <pre>{result.csr}</pre>
          </Box>
          <Button
            variant="outlined"
            onClick={() => copyToClipboard(result.csr, 'CSR')}
            sx={{ mb: 3 }}
          >
            Copy CSR
          </Button>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h5" gutterBottom>
            Private Key
          </Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Keep your private key secure! Never share it with anyone.
          </Alert>
          <Box className="code-block" sx={{ mb: 3 }}>
            <pre>{result.privateKey}</pre>
          </Box>
          <Button
            variant="outlined"
            onClick={() => copyToClipboard(result.privateKey, 'Private Key')}
            sx={{ mb: 3 }}
          >
            Copy Private Key
          </Button>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h5" gutterBottom>
            Next Steps
          </Typography>
          <Typography variant="body1" paragraph>
            1. Save both the CSR and private key to secure files.
          </Typography>
          <Typography variant="body1" paragraph>
            2. Submit the CSR to your Certificate Authority (CA) to obtain an SSL certificate.
          </Typography>
          <Typography variant="body1" paragraph>
            3. Once you receive your certificate, you'll need the private key for installation.
          </Typography>
        </Paper>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Generator;
