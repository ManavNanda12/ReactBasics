import React, { useContext } from 'react';
import { CircularProgress, Box, Skeleton } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { HeaderContext } from '../layout/Header';

export default function Loader({ showLoader }) {
  const { currentTheme } = useContext(HeaderContext);
  const darkTheme = createTheme({ palette: { mode: currentTheme } });

  return (
    <ThemeProvider theme={darkTheme}>
      {showLoader ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress color="primary" size={50} />
        </Box>
      ) : (
        <Box>
          <Skeleton variant="text" height={40} />
          <Skeleton variant="rectangular" height={50} sx={{ my: 1 }} />
          <Skeleton variant="rectangular" height={50} sx={{ my: 1 }} />
          <Skeleton variant="rectangular" height={50} sx={{ my: 1 }} />
        </Box>
      )}
    </ThemeProvider>
  );
}
