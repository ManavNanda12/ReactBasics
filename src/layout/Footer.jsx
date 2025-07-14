import React from 'react';
import { Box, Typography, IconButton, Link } from '@mui/material';
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaGithub
} from 'react-icons/fa';
import '../assets/designfiles/Footer.css';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { HeaderContext } from '../layout/Header';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

export default function Footer() {
    const { t } = useTranslation();
    const socialLinks = [
        { icon: <FaFacebookF />, url: 'https://facebook.com' },
        { icon: <FaTwitter />, url: 'https://twitter.com' },
        { icon: <FaInstagram />, url: 'https://instagram.com' },
        { icon: <FaLinkedinIn />, url: 'https://linkedin.com' },
        { icon: <FaGithub />, url: 'https://github.com' },
    ];
    const { currentTheme } = useContext(HeaderContext);
    const theme = createTheme({ palette: { mode: currentTheme } });
    const currentRoute = useLocation();
    const currentPath = currentRoute.pathname;

  return (
    <>
      {currentPath === "/login" ? null : (
      <ThemeProvider theme={theme}>   
      <Box
        className="animated-footer"
        sx={{
          bgcolor: 'background.default',
          color: 'text.secondary',
          mt: 5,
          py: 4,
          px: 2,
          textAlign: 'center',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.05)',
        }}
      >
        <Typography variant="h6" gutterBottom>
          Follow Us
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
          {socialLinks.map((link, index) => (
            <Link
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              key={index}
              sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
            >
              <IconButton color="inherit" size="large">
                {link.icon}
              </IconButton>
            </Link>
          ))}
        </Box>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} {t("johndoe")}. {t("allRightsReserved")}.
        </Typography>
      </Box>
      </ThemeProvider>
      )}
    </>
  );
}
