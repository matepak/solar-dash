import React from 'react';
import { Grid, Typography, Paper, Box, Alert, Button } from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import KpIndexGraph from '../components/KpIndexGraph';
import KpIndexGauge from '../components/KpIndexGauge';
import KpForecastTable from '../components/KpForecastTable';
import { useKpIndexData } from '../hooks/useKpIndexData';
import { useKpForecastData } from '../hooks/useKpForecastData';
import { useAuth } from '../context/AuthContext';
import { useAlerts } from '../context/AlertsContext';

const Dashboard: React.FC = () => {
  const { currentKpValue, loading: kpLoading, error: kpError } = useKpIndexData();
  const { maxForecastedKp } = useKpForecastData();
  const { user } = useAuth();
  const { alertSettings } = useAlerts();
  const navigate = useNavigate();
  
  // Determine if there should be an alert shown (current or forecasted storm conditions)
  const shouldShowStormAlert = 
    (currentKpValue !== null && currentKpValue >= 5) || 
    (maxForecastedKp >= 5);
  
  // Determine if the user should be notified based on their alert settings
  const shouldNotifyUser = 
    user && 
    alertSettings?.kpThreshold && 
    (currentKpValue !== null && currentKpValue >= alertSettings.kpThreshold);
  
  return (
    <div>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Solar Activity Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Monitor real-time Kp index data, forecast, and geomagnetic storm conditions.
        </Typography>
        
        {shouldShowStormAlert && (
          <Alert 
            severity="warning" 
            sx={{ mb: 3 }}
            action={
              user ? null : (
                <Button color="inherit" size="small" onClick={() => navigate('/login')}>
                  Login for alerts
                </Button>
              )
            }
          >
            Geomagnetic storm conditions detected! Aurora may be visible at higher latitudes.
          </Alert>
        )}
        
        {shouldNotifyUser && (
          <Alert 
            severity="info" 
            sx={{ mb: 3 }}
            icon={<NotificationsIcon />}
            action={
              <Button color="inherit" size="small" onClick={() => navigate('/profile')}>
                Manage alerts
              </Button>
            }
          >
            Kp index has reached your alert threshold of {alertSettings.kpThreshold}
          </Alert>
        )}
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <KpIndexGauge
            kpValue={currentKpValue}
            loading={kpLoading}
            error={kpError}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <KpIndexGraph />
        </Grid>
        <Grid item xs={12}>
          <KpForecastTable />
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;
