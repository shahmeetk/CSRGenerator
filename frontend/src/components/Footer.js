import React from 'react';
import { Box, Container, Typography, Link, Grid, IconButton } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/Email';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3} justifyContent="space-between">
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              CSR Generator Tool
            </Typography>
            <Typography variant="body2" color="text.secondary">
              A comprehensive Certificate Signing Request (CSR) management tool with AI-powered features.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <IconButton
              component={Link}
              href="https://github.com/shahmeetk/CSRGenerator"
              target="_blank"
              rel="noopener noreferrer"
              color="inherit"
              aria-label="GitHub"
            >
              <GitHubIcon />
            </IconButton>
            <IconButton
              component={Link}
              href="https://linkedin.com/in/meetshah"
              target="_blank"
              rel="noopener noreferrer"
              color="inherit"
              aria-label="LinkedIn"
            >
              <LinkedInIcon />
            </IconButton>
            <IconButton
              component={Link}
              href="mailto:contact@example.com"
              color="inherit"
              aria-label="Email"
            >
              <EmailIcon />
            </IconButton>
          </Grid>
        </Grid>
        <Box mt={2}>
          <Typography variant="body2" color="text.secondary" align="center">
            {'© '}
            {new Date().getFullYear()}
            {' '}
            <Link color="inherit" href="https://github.com/shahmeetk">
              Meet Shah
            </Link>
            {'. All rights reserved.'}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
