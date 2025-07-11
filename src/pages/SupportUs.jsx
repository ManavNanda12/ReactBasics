import React, { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HeaderContext } from '../layout/Header';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Box,
  TextField,
  Button,
  Container,
  Paper,
  Typography,
} from '@mui/material';
import { useStripe, useElements, CardElement ,PaymentRequestButtonElement} from '@stripe/react-stripe-js';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loader from '../common/loader';
import '../assets/designfiles/Donation.css'; // include animation CSS if needed

export default function SupportUs() {
  const { t } = useTranslation();
  const { currentTheme } = useContext(HeaderContext);
  const stripe = useStripe();
  const elements = useElements();
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [donationForm, setDonationForm] = useState({
    name: '',
    amount: '',
    message: ''
  });

  const theme = createTheme({
    palette: { mode: currentTheme }
  });

  const handleDonationFormChange = (e) => {
    setDonationForm({ ...donationForm, [e.target.name]: e.target.value });
  };

  const submitDonationForm = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return toast.error("Stripe not loaded.");
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return toast.error("Card element not found.");

    const payload = {
      name: donationForm.name,
      email: localStorage.getItem('userEmail'),
      amount: Number(donationForm.amount),
      message: donationForm.message,
    };

    try {
      setLoading(true);
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/payment/create-payment-intent`, payload);

      const result = await stripe.confirmCardPayment(res.data.clientSecret, {
        payment_method: { card: cardElement },
      });

      if (result.error) {
        toast.error(result.error.message);
      } else if (result.paymentIntent?.status === 'succeeded') {
        await axios.post(`${process.env.REACT_APP_API_URL}/payment/confirm`, {
          paymentId: result.paymentIntent.id,
          paymentIntent: result.paymentIntent
        });
        toast.success('Thank you for your support!');
        setDonationForm({ name: '', amount: '', message: '' });
        cardElement.clear();
      } else {
        toast.error("Payment failed.");
      }

    } catch (err) {
      toast.error("Payment failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (stripe && donationForm.amount > 0) {
      const pr = stripe.paymentRequest({
        country: 'US',
        currency: 'usd',
        total: {
          label: 'Donation',
          amount: Number(donationForm.amount) * 100,
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });
  
      pr.canMakePayment().then(result => {
        if (result) {
          setPaymentRequest(pr);
        } else {
          setPaymentRequest(null);
        }
      });
    }
  }, [stripe, donationForm.amount]);

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="sm" sx={{ mt: 5 }}>
        {loading ? <Loader showLoader /> : null}
        <Paper
          elevation={4}
          className="animated-donation-card"
          sx={{
            p: 4,
            borderRadius: 4,
            bgcolor: 'background.paper',
            color: 'text.primary',
            boxShadow: 6,
            animation: 'fadeInUp 0.8s ease-in-out',
          }}
        >
          <Typography variant="h5" fontWeight="bold" align="center" gutterBottom>
            {t("supportUs")}
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
            {t("supportUsDescription")}
          </Typography>

          <Box component="form" onSubmit={submitDonationForm} sx={{ mt: 3 }}>
            <TextField
              label={t("name")}
              name="name"
              fullWidth
              value={donationForm.name}
              onChange={handleDonationFormChange}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              label={t("amount")}
              name="amount"
              fullWidth
              type="number"
              value={donationForm.amount}
              onChange={handleDonationFormChange}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              label={t("message")}
              name="message"
              fullWidth
              multiline
              rows={3}
              value={donationForm.message}
              onChange={handleDonationFormChange}
              sx={{ mb: 2 }}
            />
            <Typography variant="subtitle1" gutterBottom>
              {paymentRequest ? `${t("orPayWithCard")}` : `${t("enterCardDetails")}`}
            </Typography>
            <Box
              sx={{
                p: 2,
                mb: 3,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fafafa',
              }}
            >
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: theme.palette.text.primary,
                      '::placeholder': {
                        color: theme.palette.text.secondary,
                      },
                      fontFamily: 'inherit',
                    },
                    invalid: {
                      color: theme.palette.error.main,
                    },
                  },
                }}
              />
            </Box>
            {paymentRequest && (
              <Box sx={{ mb: 3 }}>
                <PaymentRequestButtonElement
                  options={{ paymentRequest }}
                  onClick={(e) => {
                    if (!donationForm.amount || donationForm.amount <= 0) {
                      toast.error("Please enter a valid amount before proceeding.");
                      e.preventDefault();
                    }
                  }}
                />
              </Box>
            )}

            <Box textAlign="center">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{ px: 5, py: 1.5, fontWeight: 'bold' }}
              >
                {loading ? "Processing..." : t("submit")}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}
