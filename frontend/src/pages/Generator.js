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
  AlertTitle,
  Snackbar,
  FormHelperText,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Tooltip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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

    // If we're on the last step, just finish
    if (activeStep === steps.length - 1) {
      handleReset();
      return;
    }

    // If we're on step 0, validate and move to step 1
    if (activeStep === 0) {
      // Basic validation
      if (!formData.commonName || !formData.organization || !formData.country || !formData.service || !formData.environment) {
        setSnackbar({
          open: true,
          message: 'Please fill in all required fields',
          severity: 'error',
        });
        return;
      }

      // Move to step 1
      handleNext();
      return;
    }

    // If we're on step 1, generate the CSR
    if (activeStep === 1) {
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

        // Move to step 2
        handleNext();
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

  // Steps for the stepper
  const steps = ['Enter Certificate Details', 'Generate CSR', 'Download & Next Steps'];
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setFormData({
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
    setResult({
      csr: '',
      privateKey: '',
      loading: false,
      error: null,
      success: false,
    });
  };

  return (
    <Container className="page-content">
      <Typography variant="h4" component="h1" gutterBottom>
        CSR Generator
      </Typography>
      <Typography variant="body1" paragraph>
        Generate Certificate Signing Requests (CSRs) for your services. Fill out the form below to create a new CSR.
        Our tool helps you create properly formatted CSRs that can be submitted to any Certificate Authority.
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Alert severity="info">
          <AlertTitle>What is a CSR?</AlertTitle>
          A Certificate Signing Request (CSR) is a block of encoded text that contains information about the entity
          requesting the certificate and the public key that will be included in the certificate.
          The CSR is submitted to a Certificate Authority (CA) when applying for an SSL certificate.
        </Alert>
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

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
                  <MenuItem value="WEB">Web Server</MenuItem>
                  <MenuItem value="API">API Gateway</MenuItem>
                  <MenuItem value="ADMIN">Admin Portal</MenuItem>
                  <MenuItem value="PORTAL">Customer Portal</MenuItem>
                  <MenuItem value="APP">Mobile App</MenuItem>
                  <MenuItem value="EMAIL">Email Server</MenuItem>
                  <MenuItem value="DATABASE">Database Server</MenuItem>
                  <MenuItem value="CUSTOM">Custom Service</MenuItem>
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  disabled={activeStep === 0}
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={result.loading}
                >
                  {result.loading ? <CircularProgress size={24} /> : activeStep === steps.length - 1 ? 'Finish' : 'Generate CSR'}
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
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              This is your Certificate Signing Request (CSR) that you'll submit to a Certificate Authority.
            </Typography>
            <Tooltip title="The CSR contains your public key and organization information. It does not contain your private key.">
              <IconButton size="small">
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Box className="code-block" sx={{ mb: 3, position: 'relative', bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{result.csr}</pre>
            <IconButton
              sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.7)' }}
              onClick={() => copyToClipboard(result.csr, 'CSR')}
              size="small"
              aria-label="copy CSR"
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Box>
          <Button
            variant="outlined"
            onClick={() => copyToClipboard(result.csr, 'CSR')}
            sx={{ mb: 3 }}
            startIcon={<ContentCopyIcon />}
          >
            Copy CSR
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            sx={{ mb: 3, ml: 2 }}
            component="a"
            href={`data:application/text;charset=utf-8,${encodeURIComponent(result.csr)}`}
            download="certificate-signing-request.csr"
          >
            Download CSR
          </Button>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h5" gutterBottom>
            Private Key
          </Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Keep your private key secure! Never share it with anyone. Store it safely as you'll need it when installing your certificate.
          </Alert>
          <Box className="code-block" sx={{ mb: 3, position: 'relative', bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{result.privateKey}</pre>
            <IconButton
              sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.7)' }}
              onClick={() => copyToClipboard(result.privateKey, 'Private Key')}
              size="small"
              aria-label="copy private key"
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Box>
          <Button
            variant="outlined"
            onClick={() => copyToClipboard(result.privateKey, 'Private Key')}
            sx={{ mb: 3 }}
            startIcon={<ContentCopyIcon />}
          >
            Copy Private Key
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            sx={{ mb: 3, ml: 2 }}
            component="a"
            href={`data:application/text;charset=utf-8,${encodeURIComponent(result.privateKey)}`}
            download="private-key.key"
          >
            Download Private Key
          </Button>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h5" gutterBottom>
            Next Steps
          </Typography>

          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">What to do with your CSR and Private Key</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Step 1</Typography>
                      <Typography variant="body2">
                        Save both the CSR and private key to secure files. Your private key should be kept confidential.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Step 2</Typography>
                      <Typography variant="body2">
                        Submit the CSR to your Certificate Authority (CA) to obtain an SSL certificate.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Step 3</Typography>
                      <Typography variant="body2">
                        Once you receive your certificate, you'll need the private key for installation on your server.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="outlined" onClick={handleReset}>Create Another CSR</Button>
            <Button
              variant="contained"
              color="primary"
              component="a"
              href="/validator"
            >
              Validate a CSR
            </Button>
          </Box>
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
