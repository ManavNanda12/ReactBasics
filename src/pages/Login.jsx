import React, { useState, useRef } from 'react';
import { Box, Container, Paper, TextField, Button, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../guard/AuthProvider';
import { toast } from 'react-toastify';
import CommonMethods from '../common/CommonMethods';
import ReCAPTCHA from 'react-google-recaptcha';

export default function Login() {
  const navigate = useNavigate();
  const setAuthData = useAuth();    
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { postMethod } = CommonMethods();
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
    if (error && error.includes('reCAPTCHA')) {
      setError('');
    }
  };

  const handleRecaptchaExpired = () => {
    setRecaptchaToken(null);
    setError('reCAPTCHA expired. Please verify again.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }
      if (!recaptchaToken) {
        throw new Error('Please complete the reCAPTCHA verification');
      }
      let user = {
        email: formData.email,
        password: formData.password
      };
      let response = await postMethod(`${process.env.REACT_APP_API_URL}/users/login`, user);
      console.log(response);
      if(response.data.success){
        console.log(response.data);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('name',  response.data.user.name);
        localStorage.setItem('email', response.data.user.email);
        localStorage.setItem('userId', response.data.user._id);
        setAuthData.login(response.data.token, 'token');
        toast("Login successful.");
        navigate('/');
      }
      else{
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
        setRecaptchaToken(null);
        toast.error(response.data.message);
      }
    } catch (err) {
      setError(err.message);
      toast("Login failed.");
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      setRecaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100dvh',
          overflow: 'hidden'
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 400,
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Login
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
                {/* reCAPTCHA Component */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 2 }}>
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                onChange={handleRecaptchaChange}
                onExpired={handleRecaptchaExpired}
                onError={() => setError('reCAPTCHA error occurred. Please try again.')}
              />
            </Box>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
