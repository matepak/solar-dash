import React from 'react';
import { Grid, Typography, Paper, Box, Alert, Button } from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AuroraForecast from '../components/AuroraForecast';
import KpIndexGraph from '../components/KpIndexGraph';
import KpIndexGauge from '../components/KpIndexGauge';
import KpForecastTable from '../components/KpForecastTable';
import { useKpIndexData } from '../hooks/useKpIndexData';
import { useKpForecastData } from '../hooks/useKpForecastData';
import { useAuth } from '../context/AuthContext';
import { useAlerts } from '../context/AlertsContext';
import NoaaMagPlotContainer from '../components/NoaaMagPlotContainer';
const Dashboard: React.FC = () => {
  const { currentKpValue, loading: kpLoading, error: kpError } = useKpIndexData();
  const { maxForecastedKp } = useKpForecastData();
  const { user } = useAuth();
  const { alertSettings } = useAlerts();
  const navigate = useNavigate();

  // Determine if there should be an alert shown (current or forecasted storm conditions)
  const hasCurrentStorm = currentKpValue !== null && currentKpValue >= 5;
  const hasForecastedStorm = maxForecastedKp >= 5;

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

        {hasCurrentStorm && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            action={
              user ? null : (
                <Button color="inherit" size="small" onClick={() => navigate('/login')}>
                  Login for alerts
                </Button>
              )
            }
          >
            Active geomagnetic storm detected! Current Kp index is {currentKpValue}. Aurora may be visible at higher latitudes.
          </Alert>
        )}

        {hasForecastedStorm && !hasCurrentStorm && (
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
            Geomagnetic storm forecasted! Maximum forecasted Kp index is {maxForecastedKp}. Monitor conditions for potential aurora visibility.
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
        <Grid item xs={12}>
          <AuroraForecast />
        </Grid>
        <Grid item xs={12}>
          <NoaaMagPlotContainer />
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;
