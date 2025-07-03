import React, { useEffect, useState } from 'react';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { IconButton, Zoom, Box } from '@mui/material';
import '../assets/designfiles/ScrollToTop.css';

export default function ScrollToTop() {
  const [atTop, setAtTop] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      setAtTop(scrollY < 100);
      setVisible(scrollY > 10);
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = () => {
    if (atTop) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <Zoom in={visible}>
      <Box className="scroll-to-top bounce">
        <IconButton color="primary" onClick={scrollTo}>
          {atTop ? <KeyboardArrowDownIcon fontSize="large" /> : <KeyboardArrowUpIcon fontSize="large" />}
        </IconButton>
      </Box>
    </Zoom>
  );
}
