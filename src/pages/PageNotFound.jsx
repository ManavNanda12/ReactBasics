import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { ArrowBack, Home } from '@mui/icons-material';

export default function PageNotFound() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: '6rem',
              fontWeight: 'bold',
              color: 'error.main',
              mb: 2,
            }}
          >
            404
          </Typography>
          <Typography
            variant="h4"
            sx={{
              mb: 3,
              fontWeight: 'medium',
              color: 'text.primary',
            }}
          >
            Page Not Found
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 4,
              color: 'text.secondary',
            }}
          >
            The page you're looking for doesn't exist or has been moved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ArrowBack />}
              onClick={handleGoBack}
              sx={{
                textTransform: 'none',
                fontSize: '1rem',
              }}
            >
              Go Back
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Home />}
              onClick={handleGoHome}
              sx={{
                textTransform: 'none',
                fontSize: '1rem',
              }}
            >
              Go Home
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
