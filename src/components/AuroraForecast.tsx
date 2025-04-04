import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const northernAuroraForecastUrl = process.env.REACT_APP_AURORA_FORECAST_NORTHERN_URL || 'https://services.swpc.noaa.gov/images/aurora-forecast-northern-hemisphere.jpg';
const southernAuroraForecastUrl = process.env.REACT_APP_AURORA_FORECAST_SOUTHERN_URL || 'https://services.swpc.noaa.gov/images/aurora-forecast-southern-hemisphere.jpg';

const AuroraForecast: React.FC = () => {

    return (
        <Paper sx={{ p: 2, boxShadow: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6">Aurora Forecast</Typography>
            <Box sx={{ gap: 2, p: 2, height: '100%', display: 'flex', flexDirection: 'row' }}>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="h6">Northern Hemisphere</Typography>
                    <img
                        src={northernAuroraForecastUrl}
                        alt="Northern Hemisphere Aurora Forecast"
                        style={{ maxWidth: '100%', height: 'auto' }}
                    />
                </Box>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="h6">Southern Hemisphere</Typography>
                    <img
                        src={southernAuroraForecastUrl}
                        alt="Southern Hemisphere Aurora Forecast"
                        style={{ maxWidth: '100%', height: 'auto' }}
                    />
                </Box>
            </Box>
        </Paper>
    );
};

export default AuroraForecast;