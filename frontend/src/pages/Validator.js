import React, { useState } from 'react';
import apiService from '../services/api';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip
} from '@mui/material';

const Validator = () => {
  const [csrData, setCsrData] = useState('');
  const [result, setResult] = useState({
    loading: false,
    error: null,
    data: null
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleChange = (e) => {
    setCsrData(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!csrData.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a CSR to validate',
        severity: 'error',
      });
      return;
    }

    setResult({ ...result, loading: true, error: null });

    try {
      const response = await apiService.validateCSR(csrData);
      setResult({
        loading: false,
        error: null,
        data: response
      });

      setSnackbar({
        open: true,
        message: response.is_valid ? 'CSR is valid!' : 'CSR validation failed',
        severity: response.is_valid ? 'success' : 'error',
      });
    } catch (error) {
      console.error('Error validating CSR:', error);
      setResult({
        loading: false,
        error: error.response?.data?.error || 'Error validating CSR. Please check the format and try again.',
        data: null
      });

      setSnackbar({
        open: true,
        message: 'Error validating CSR',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container className="page-content">
      <Typography variant="h4" component="h1" gutterBottom>
        CSR Validator
      </Typography>
      <Typography variant="body1" paragraph>
        Validate your Certificate Signing Requests (CSRs) to ensure they meet security standards and best practices.
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="CSR Content"
            multiline
            rows={10}
            value={csrData}
            onChange={handleChange}
            placeholder="Paste your CSR (PEM format) here..."
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={result.loading}
            >
              {result.loading ? <CircularProgress size={24} /> : 'Validate CSR'}
            </Button>
          </Box>
        </form>
      </Paper>

      {result.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {result.error}
        </Alert>
      )}

      {result.data && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Validation Results
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Chip
              label={result.data.is_valid ? "Valid CSR" : "Invalid CSR"}
              color={result.data.is_valid ? "success" : "error"}
              sx={{ mb: 2 }}
            />

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Subject Information
            </Typography>
            <List>
              {Object.entries(result.data.subject).map(([key, value]) => (
                <ListItem key={key} divider>
                  <Grid container>
                    <Grid item xs={4}>
                      <ListItemText primary={key} secondary={getSubjectFieldName(key)} />
                    </Grid>
                    <Grid item xs={8}>
                      <ListItemText primary={value} />
                    </Grid>
                  </Grid>
                </ListItem>
              ))}
            </List>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Technical Details
          </Typography>
          <List>
            <ListItem divider>
              <Grid container>
                <Grid item xs={4}>
                  <ListItemText primary="Key Size" />
                </Grid>
                <Grid item xs={8}>
                  <ListItemText
                    primary={`${result.data.key_size} bits`}
                    secondary={getKeySizeRating(result.data.key_size)}
                  />
                </Grid>
              </Grid>
            </ListItem>
            <ListItem divider>
              <Grid container>
                <Grid item xs={4}>
                  <ListItemText primary="Signature Algorithm" />
                </Grid>
                <Grid item xs={8}>
                  <ListItemText
                    primary={result.data.signature_algorithm}
                    secondary={getAlgorithmRating(result.data.signature_algorithm)}
                  />
                </Grid>
              </Grid>
            </ListItem>
          </List>
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

// Helper functions
const getSubjectFieldName = (key) => {
  const fieldNames = {
    'CN': 'Common Name',
    'O': 'Organization',
    'OU': 'Organizational Unit',
    'L': 'Locality',
    'ST': 'State/Province',
    'C': 'Country',
    'emailAddress': 'Email Address'
  };
  return fieldNames[key] || key;
};

const getKeySizeRating = (keySize) => {
  if (keySize >= 4096) return 'Excellent - Very Strong Security';
  if (keySize >= 2048) return 'Good - Recommended Minimum';
  return 'Weak - Not Recommended';
};

const getAlgorithmRating = (algorithm) => {
  if (algorithm.includes('sha256') || algorithm.includes('sha384') || algorithm.includes('sha512')) {
    return 'Good - Modern Algorithm';
  }
  if (algorithm.includes('sha1')) {
    return 'Weak - SHA-1 is deprecated';
  }
  if (algorithm.includes('md5')) {
    return 'Insecure - MD5 is not secure';
  }
  return 'Unknown rating';
};

export default Validator;
