import React, { useContext, useState } from 'react'
import { Circles } from 'react-loader-spinner'
import { HeaderContext } from '../layout/Header';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Box, Skeleton } from '@mui/material';

export default function Loader({ showLoader }) {
    const { currentTheme } = useContext(HeaderContext);
    const darkTheme = createTheme({ palette: { mode: currentTheme } });
  return (
   <>
   <ThemeProvider theme={darkTheme}>
    {showLoader ? <div style={{ display: 'flex', justifyContent: 'center', marginTop: 50 }}>
        <Circles
            height={50}
            width={50}
            color="#4fa94d"
            ariaLabel="loading-indicator"
        />
        </div>: <Box>
          <Skeleton variant="text" height={40} />
          <Skeleton variant="rectangular" height={50} sx={{ my: 1 }} />
          <Skeleton variant="rectangular" height={50} sx={{ my: 1 }} />
          <Skeleton variant="rectangular" height={50} sx={{ my: 1 }} />
        </Box>}
   </ThemeProvider>
   </>
  )
}
