import React, { useEffect, useState } from 'react';
import { AlertsData, fetchAlertsData } from '../api/noaaApi';
import {
    Box,
    Typography,
    Paper,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    CircularProgress,
    Button,
    Stack,
    IconButton,
    Tooltip
} from '@mui/material';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { startOfDay, endOfDay } from 'date-fns';

const getAlertIcon = (productId: string) => {
    // K06 and above are severe geomagnetic storms
    if (productId.startsWith('K0') && parseInt(productId[2]) >= 6) {
        return <ErrorIcon color="error" />;
    }
    return <WarningIcon color="warning" />;
};

const formatDateTime = (dateTimeStr: string) => {
    return new Date(dateTimeStr).toLocaleString();
};

const formatMessage = (message: string) => {
    // Split message into paragraphs for better readability
    return message.split('\r\n').map((line, index) => (
        <Typography key={index} variant="body2" sx={{ mb: line.trim() ? 1 : 0.5 }}>
            {line}
        </Typography>
    ));
};

const AlertsPanel: React.FC = () => {
    const [alerts, setAlerts] = useState<AlertsData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([new Date(), new Date()]);
    const [currentPage, setCurrentPage] = useState(0);
    const alertsPerPage = 3;

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                setLoading(true);
                const data = await fetchAlertsData();
                // Sort alerts by date, most recent first
                const sortedAlerts = data.sort((a, b) =>
                    new Date(b.issue_datetime).getTime() - new Date(a.issue_datetime).getTime()
                );
                setAlerts(sortedAlerts);
            } catch (err) {
                setError('Failed to fetch alerts');
                console.error('Error fetching alerts:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAlerts();
        // Refresh alerts every 5 minutes
        const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const filteredAlerts = alerts.filter(alert => {
        if (!dateRange[0] || !dateRange[1]) return true;
        const alertDate = new Date(alert.issue_datetime);
        const startDate = startOfDay(dateRange[0]);
        const endDate = endOfDay(dateRange[1]);
        return alertDate >= startDate && alertDate <= endDate;
    });

    const totalPages = Math.ceil(filteredAlerts.length / alertsPerPage);
    const displayedAlerts = filteredAlerts.slice(
        currentPage * alertsPerPage,
        (currentPage + 1) * alertsPerPage
    );

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
    };

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 0));
    };

    const handleResetDateRange = () => {
        setDateRange([new Date(), new Date()]);
        setCurrentPage(0);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
                <Typography>{error}</Typography>
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h6">
                    Space Weather Alerts
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DateRangePicker
                            localeText={{ start: 'Start date', end: 'End date' }}
                            value={dateRange}
                            onChange={(newValue) => {
                                setDateRange(newValue);
                                setCurrentPage(0);
                            }}
                            slotProps={{
                                textField: {
                                    size: "small",
                                    sx: { width: 150 }
                                }
                            }}
                        />
                    </LocalizationProvider>
                    <Tooltip title="Reset date range">
                        <IconButton
                            onClick={handleResetDateRange}
                            size="small"
                            color="primary"
                            sx={{ ml: 1 }}
                        >
                            <RestartAltIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {displayedAlerts.length === 0 ? (
                <Typography>No alerts for selected date</Typography>
            ) : (
                <>
                    {displayedAlerts.map((alert) => (
                        <Accordion key={`${alert.product_id}-${alert.issue_datetime}`} sx={{ mb: 1 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {getAlertIcon(alert.product_id)}
                                    <Typography>
                                        {alert.product_id} - {formatDateTime(alert.issue_datetime)}
                                    </Typography>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Box sx={{ pl: 1 }}>
                                    {formatMessage(alert.message)}
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    ))}

                    <Stack
                        direction="row"
                        spacing={2}
                        justifyContent="center"
                        alignItems="center"
                        sx={{ mt: 2 }}
                    >
                        <Button
                            startIcon={<NavigateBeforeIcon />}
                            onClick={handlePrevPage}
                            disabled={currentPage === 0}
                            size="small"
                        >
                            Previous
                        </Button>
                        <Typography>
                            Page {currentPage + 1} of {Math.max(totalPages, 1)}
                        </Typography>
                        <Button
                            endIcon={<NavigateNextIcon />}
                            onClick={handleNextPage}
                            disabled={currentPage >= totalPages - 1}
                            size="small"
                        >
                            Next
                        </Button>
                    </Stack>
                </>
            )}
        </Paper>
    );
};

export default AlertsPanel; 