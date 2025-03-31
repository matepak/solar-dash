import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

const northernAuroraForecastUrl = process.env.REACT_APP_AURORA_FORECAST_NORTHERN_URL;
const southernAuroraForecastUrl = process.env.REACT_APP_AURORA_FORECAST_SOUTHERN_URL;

const AuroraForecast: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6">Aurora Forecast</Typography>
            <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'row' }}>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="h6">Northern Hemisphere</Typography>
                    <img src={northernAuroraForecastUrl} alt="Aurora" width={500} height={500} />
                </Box>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="h6">Southern Hemisphere</Typography>
                    <img src={southernAuroraForecastUrl} alt="Aurora" width={500} height={500} />
                </Box>
            </Box>
        </Paper>
    );
};

export default AuroraForecast;