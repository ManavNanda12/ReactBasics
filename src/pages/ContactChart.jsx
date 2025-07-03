import React, { useContext, useEffect, useState } from 'react';
import { RadialBarChart, RadialBar, Tooltip } from 'recharts';
import {
    ThemeProvider,
    createTheme,
    Box,
    Typography,
    Paper,
} from '@mui/material';
import { HeaderContext } from '../layout/Header';
import '../assets/designfiles/Banner.css';
import axios from 'axios';
import Loader from '../common/loader';

export default function ContactChart() {
    const { currentTheme } = useContext(HeaderContext);
    const theme = createTheme({ palette: { mode: currentTheme } });
    let [data, setData] = useState([]);
    const fetchContactedUsers = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/contactedUsers/get`);
            if (res.data.length > 0) {
                let contactData = {
                    name: 'Contacted Users',
                    count: res.data.length,
                    fill: theme.palette.primary.main,
                };
                setData([contactData]);
            }
        }
        catch (err) {
            console.log(err);
        }
    }
    useEffect(() => {
        fetchContactedUsers();
    }, []);

    return (
        <ThemeProvider theme={theme}>
            {data.length > 0 ? (
                <Paper
                    elevation={3}
                    sx={{
                        p: 3,
                        borderRadius: 3,
                        bgcolor: 'background.paper',
                        color: 'text.primary',
                    }}
                    className="rise-up"
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1,
                        }}
                    >
                        {/* Chart Section */}
                        <Box
                            sx={{
                                flexBasis: { xs: '100%', md: '35%' },
                                display: 'flex',
                                justifyContent: 'center',
                                position: 'relative',
                            }}
                        >
                            <Box position="relative">
                                <RadialBarChart
                                    width={250}
                                    height={250}
                                    innerRadius="80%"
                                    outerRadius="100%"
                                    data={data}
                                    startAngle={90}
                                    endAngle={-270}
                                >
                                    <RadialBar
                                        background
                                        clockWise
                                        dataKey="count"
                                        animationDuration={1200}
                                        cornerRadius={10}
                                    />
                                    <Tooltip />
                                </RadialBarChart>

                                <Box
                                    position="absolute"
                                    top="50%"
                                    left="50%"
                                    sx={{ transform: 'translate(-50%, -50%)' }}
                                >
                                    <Typography className='text-center' variant="h4" color="text.primary">
                                        {data[0].count}+
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Happy Clients
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Text Section */}
                        <Box
                            sx={{
                                flexBasis: { xs: '100%', md: '65%' },
                                textAlign: { xs: 'center', md: 'left' },
                            }}
                        >
                            <Typography variant="h5" fontWeight="bold" gutterBottom>
                                Trusted by Our Community
                            </Typography>
                            <Typography variant="body1" color="text.secondary" paragraph>
                                Each client represents a conversation that matters. We aim to deliver quick and
                                helpful responses to every message we receive.
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                With {data[0].count}+ contact requests so far, your voice truly drives us forward.
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            ) : (
                <Loader showLoader={false} />
            )}
        </ThemeProvider>

    );
}
