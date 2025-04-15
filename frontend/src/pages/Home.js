import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Paper,
} from '@mui/material';
import CreateIcon from '@mui/icons-material/Create';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

const features = [
  {
    title: 'CSR Generator',
    description: 'Create CSRs for different services and environments with ease.',
    icon: <CreateIcon fontSize="large" color="primary" />,
    path: '/generator',
  },
  {
    title: 'CSR Validator',
    description: 'Validate existing CSRs for correctness and best practices.',
    icon: <VerifiedUserIcon fontSize="large" color="primary" />,
    path: '/validator',
  },
];

const Home = () => {
  return (
    <Box className="page-content">
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'grey.800',
          color: '#fff',
          mb: 4,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundImage: 'url(https://source.unsplash.com/random?ssl,security)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,.5)',
          }}
        />
        <Box
          sx={{
            position: 'relative',
            p: { xs: 3, md: 6 },
            pr: { md: 0 },
          }}
        >
          <Typography component="h1" variant="h3" color="inherit" gutterBottom>
            CSR Generator Tool
          </Typography>
          <Typography variant="h5" color="inherit" paragraph>
            A Certificate Signing Request (CSR) management tool.
            Simplify your SSL certificate management workflow with tools designed for security professionals, system administrators, and DevOps engineers.
          </Typography>
          <Button variant="contained" color="primary" component={RouterLink} to="/generator">
            Get Started
          </Button>
        </Box>
      </Paper>

      <Container maxWidth="lg">
        <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
          Features
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature) => (
            <Grid item key={feature.title} xs={12} sm={6} md={4}>
              <Card className="feature-card">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" component="div" gutterBottom align="center">
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    {feature.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', mt: 'auto' }}>
                  <Button size="small" component={RouterLink} to={feature.path}>
                    Learn More
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 6, mb: 4 }}>
          <Typography variant="h4" component="h2" gutterBottom align="center">
            Why Use Our CSR Generator Tool?
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Streamlined Workflow
              </Typography>
              <Typography variant="body1">
                Our tool simplifies the CSR lifecycle, from creation to validation,
                saving you time and reducing errors. What used to take minutes now takes seconds.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Comprehensive Security
              </Typography>
              <Typography variant="body1">
                Our validator helps ensure your CSRs meet security standards,
                protecting your organization from potential threats.
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
