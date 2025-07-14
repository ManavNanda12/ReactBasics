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
import Loader from '../common/loader';
import { useTranslation } from 'react-i18next';
import CommonMethods from '../common/CommonMethods';

export default function ContactChart() {
    const { currentTheme } = useContext(HeaderContext);
    const theme = createTheme({ palette: { mode: currentTheme } });
    const { getMethod } = CommonMethods();
    const [data, setData] = useState([]);
    const { t } = useTranslation();
    const fetchContactedUsers = async () => {
        try {
            const res = await getMethod(`${process.env.REACT_APP_API_URL}/contactedUsers/get`);
            if (res.data.length > 0) {
                let contactData = {
                    name: t('contactedUsers'),
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
                                        {t('happyClients')}
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
                                {t('trustedByCommunity')}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" paragraph>
                                {t('trustedDescription')}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                {t('voiceForward', { count: data[0].count })}
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
