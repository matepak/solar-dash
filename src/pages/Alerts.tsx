import React from 'react';
import { Typography, Box } from '@mui/material';
import AlertsPanel from '../components/AlertsPanel';

const Alerts: React.FC = () => {
    return (
        <div>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Space Weather Alerts
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    Monitor and manage space weather alerts and notifications.
                </Typography>
            </Box>
            <AlertsPanel />
        </div>
    );
};

export default Alerts; 