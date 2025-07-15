import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { HeaderContext } from '../layout/Header';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Box, Typography, Paper } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../assets/designfiles/Banner.css'; 

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default function LocationMap() {
  const { t } = useTranslation();
  const { currentTheme } = useContext(HeaderContext);
  const position = [22.4442083, 70.0670611];

  const theme = createTheme({
    palette: {
      mode: currentTheme === 'dark' ? 'dark' : 'light',
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Paper
        elevation={3}
        className="rise-up"
        sx={{
          p: 3,
          borderRadius: 3,
          bgcolor: 'background.paper',
          color: 'text.primary',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          {/* Text Section (Left) */}
          <Box
            sx={{
              flexBasis: { xs: '100%', md: '40%' },
              textAlign: { xs: 'center', md: 'left' },
            }}
          >
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {t('whereYouCanFindUs')}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {t('mapDescription') ||
                'We’re globally available and expanding our presence in India and beyond. Use the map to find us or reach out directly.'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              📍 Coordinates: {position[0]}, {position[1]}
            </Typography>
          </Box>

          {/* Map Section (Right) */}
          <Box
            sx={{
              flexBasis: { xs: '100%', md: '60%' },
              height: { xs: '300px', md: '70vh' },
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <MapContainer
              center={position}
              zoom={5}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
              />
              <Marker position={position}>
                <Popup>{t('visitUs') || "We're here. Come say hi!"}</Popup>
              </Marker>
            </MapContainer>
          </Box>
        </Box>
      </Paper>
    </ThemeProvider>
  );
}
