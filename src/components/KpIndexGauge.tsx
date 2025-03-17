import React from 'react';
import { Box, Paper, Typography, CircularProgress, Alert, useTheme } from '@mui/material';
import GaugeChart from 'react-gauge-chart';

interface KpIndexGaugeProps {
  kpValue: number | null;
  loading?: boolean;
  error?: Error | null;
  className?: string;
}

const KpIndexGauge: React.FC<KpIndexGaugeProps> = ({ 
  kpValue, 
  loading = false, 
  error = null, 
  className 
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // Map Kp value to NOAA G-scale
  const getGScale = (kp: number): string => {
    if (kp < 5) return 'G0';
    if (kp === 5) return 'G1 Minor';
    if (kp === 6) return 'G2 Moderate';
    if (kp === 7) return 'G3 Strong';
    if (kp === 8) return 'G4 Severe';
    return 'G5 Extreme';
  };

  // Map Kp value to color
  const getColor = (kp: number): string => {
    if (kp < 5) return '#00b050'; // Green
    if (kp === 5) return '#ffff00'; // Yellow
    if (kp === 6) return '#ffc000'; // Orange
    if (kp === 7) return '#ff0000'; // Red
    return '#7f0000'; // Dark red
  };

  // Get the description of the Kp value
  const getDescription = (kp: number): string => {
    if (kp < 5) return 'No geomagnetic storm';
    if (kp === 5) return 'Minor geomagnetic storm';
    if (kp === 6) return 'Moderate geomagnetic storm';
    if (kp === 7) return 'Strong geomagnetic storm';
    if (kp === 8) return 'Severe geomagnetic storm';
    return 'Extreme geomagnetic storm';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Failed to load Kp Index data. Please try again later.
      </Alert>
    );
  }

  return (
    <Paper 
      className={className} 
      sx={{ 
        p: 2, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}
    >
      <Typography variant="h6" component="div" gutterBottom>
        Current Kp Index
      </Typography>
      
      {kpValue !== null ? (
        <>
          <Box sx={{ width: '100%', maxWidth: 300 }}>
            <GaugeChart
              id="kp-gauge-chart"
              nrOfLevels={9}
              colors={['#00b050', '#92d050', '#ffff00', '#ffc000', '#ff0000', '#c00000', '#7f0000']}
              arcWidth={0.3}
              percent={kpValue / 9}
              textColor={isDarkMode ? '#ffffff' : '#000000'}
              needleColor={isDarkMode ? '#cccccc' : '#000000'}
              needleBaseColor={isDarkMode ? '#aaaaaa' : '#444444'}
              formatTextValue={() => kpValue.toFixed(1)}
            />
          </Box>
          
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              mt: 1, 
              color: getColor(Math.round(kpValue)), 
              fontWeight: 'bold' 
            }}
          >
            {getGScale(Math.round(kpValue))}
          </Typography>
          
          <Typography variant="body1" sx={{ mt: 1, textAlign: 'center' }}>
            {getDescription(Math.round(kpValue))}
          </Typography>
          
          {Math.round(kpValue) >= 5 && (
            <Alert severity="warning" sx={{ mt: 2, width: '100%' }}>
              Geomagnetic storm in progress. Aurora may be visible at higher latitudes.
            </Alert>
          )}
        </>
      ) : (
        <Typography variant="body1" color="text.secondary">
          No data available
        </Typography>
      )}
    </Paper>
  );
};

export default KpIndexGauge;
