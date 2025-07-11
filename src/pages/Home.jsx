import React, { useContext } from 'react'
import '../assets/designfiles/Banner.css';
import { HeaderContext } from '../layout/Header';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { Paper, Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import bannerLogo from '../assets/images/bannerLogo.png';
import ContactChart from './ContactChart';
import DonationChart from './DonationChart';

export default function Home() {
  let { currentTheme, lang } = useContext(HeaderContext);
  const darkTheme = createTheme({ palette: { mode: currentTheme } });
  const { t } = useTranslation();

  return (
    <>
    <ThemeProvider theme={darkTheme}>
      <Paper
        elevation={3}
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderRadius: 3,
        }}
      >
        {
          <Box
            className="banner-drop animate__animated animate__fadeInDown"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 2,
              px: 2,
              bgcolor: 'background.default',
              color: 'text.primary',
            }}
          >
            {/* Text Section */}
            <Box sx={{ flex: 2 }}>
              <Typography variant="h5" fontWeight="bold">
                {t("bannerTitle")}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {t("bannerDescription")}
              </Typography>
            </Box>

            {/* Image Section */}
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <img
                src={bannerLogo}
                alt="Banner"
                style={{ width: '100%', maxWidth: 300, borderRadius: 10 }}
              />
            </Box>
          </Box>

        }
      </Paper>
    </ThemeProvider>
    <div className="mt-3">
      <ContactChart/>
    </div>
    <div className="mt-3">
      <DonationChart/>
    </div>  
    </>
  )
}
