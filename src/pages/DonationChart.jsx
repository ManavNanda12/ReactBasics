import React, { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HeaderContext } from '../layout/Header';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Paper, Box, Typography } from '@mui/material';
import {
    ResponsiveContainer,
    BarChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Bar
} from 'recharts';
import Loader from '../common/loader';
import '../assets/designfiles/Banner.css';
import CommonMethods from '../common/CommonMethods';
export default function DonationChart() {
    const { currentTheme } = useContext(HeaderContext);
    const theme = createTheme({ palette: { mode: currentTheme } });
    const { t } = useTranslation();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const { getMethod } = CommonMethods();

    const fetchDonations = async () => {
        try {
            setLoading(true);
            const res = await getMethod(`${process.env.REACT_APP_API_URL}/payment/donations`);
            const donations = res.data.donations.filter(x=>x.paymentStatus === "succeeded");   
            const groupedByMonth = {};
            donations.forEach((donation) => {
                const month = new Date(donation.createdAt).toLocaleString('default', {
                    month: 'short',
                    year: 'numeric'
                });
                groupedByMonth[month] = (groupedByMonth[month] || 0) + donation.amount;
            });

            const chartData = Object.entries(groupedByMonth).map(([month, amount]) => ({
                month,
                amount
            }));
            setData(chartData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDonations();
    }, []);

    const formatAmount = (amount) => {
        return `$${amount.toLocaleString()}`;
    };

    return (
        <>
            <ThemeProvider theme={theme}>
                {loading ? (
                    <Loader showLoader={true} />
                ) : (
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
                        <Box>
                            <Typography variant="h5" fontWeight="bold" textAlign="center" gutterBottom>
                                {t('monthlyDonations')}
                            </Typography>
                            <Typography variant="h6" color="text.secondary" textAlign="center" gutterBottom>
                                {t('monthlyDonationsDescription')}
                            </Typography>

                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }} stackOffset='wiggle'>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" reversed />
                                    <YAxis
                                        tickFormatter={(val) => `$${val / 1000}k`}
                                        width={60}
                                    />
                                    <Tooltip
                                        formatter={(value) => formatAmount(value)}
                                        labelStyle={{ fontWeight: 'bold' }}
                                        itemStyle={{ color: theme.palette.primary.main }}
                                    />
                                    <Bar
                                        dataKey="amount"
                                        fill={theme.palette.primary.main}
                                        radius={[8, 8, 0, 0]}
                                        animationDuration={1000}
                                        style={{ cursor: 'pointer' }}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                )}
            </ThemeProvider>
        </>);
}
