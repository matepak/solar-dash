import React, { useState } from 'react';
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
  Switch,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useAuth } from '../context/AuthContext';
import { useAlerts } from '../context/AlertsContext';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { alertSettings, updateAlertSettings, loading: alertsLoading, isUpdating } = useAlerts();
  
  const [kpThreshold, setKpThreshold] = useState(alertSettings.kpThreshold);
  const [emailAlerts, setEmailAlerts] = useState(alertSettings.emailAlerts);
  const [pushNotifications, setPushNotifications] = useState(alertSettings.pushNotifications);
  const [alertFrequency, setAlertFrequency] = useState(alertSettings.alertFrequency);
  const [locations, setLocations] = useState<string[]>(alertSettings.locations || []);
  const [newLocation, setNewLocation] = useState('');
  
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Map Kp threshold to text label
  const getKpLabel = (value: number) => {
    if (value < 5) return `Kp ${value} (No storm)`;
    if (value === 5) return 'Kp 5 (G1 - Minor)';
    if (value === 6) return 'Kp 6 (G2 - Moderate)';
    if (value === 7) return 'Kp 7 (G3 - Strong)';
    if (value === 8) return 'Kp 8 (G4 - Severe)';
    return 'Kp 9 (G5 - Extreme)';
  };
  
  const handleSaveSettings = async () => {
    try {
      setSaveSuccess(false);
      setSaveError(null);
      
      await updateAlertSettings({
        kpThreshold,
        emailAlerts,
        pushNotifications,
        alertFrequency,
        locations
      });
      
      setSaveSuccess(true);
      // Automatically hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error saving settings:', error);
      setSaveError('Failed to save settings. Please try again.');
    }
  };
  
  const handleAddLocation = () => {
    if (newLocation && !locations.includes(newLocation)) {
      setLocations([...locations, newLocation]);
      setNewLocation('');
    }
  };
  
  const handleRemoveLocation = (location: string) => {
    setLocations(locations.filter(loc => loc !== location));
  };
  
  if (!user) {
    return (
      <Alert severity="warning">
        You must be logged in to view this page.
      </Alert>
    );
  }
  
  if (alertsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Profile & Preferences
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'primary.main',
                    color: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    fontSize: '2rem'
                  }}
                >
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                </Box>
                
                <Typography variant="h6">
                  {user.displayName || 'User'}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
              <Button size="small" variant="outlined">
                Edit Profile
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Alert Preferences
            </Typography>
            
            {saveSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Your settings have been saved successfully.
              </Alert>
            )}
            
            {saveError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {saveError}
              </Alert>
            )}
            
            <Box sx={{ mb: 3 }}>
              <Typography id="kp-threshold-slider" gutterBottom>
                Kp Alert Threshold
              </Typography>
              <Slider
                value={kpThreshold}
                onChange={(_, newValue) => setKpThreshold(newValue as number)}
                getAriaValueText={getKpLabel}
                valueLabelFormat={getKpLabel}
                step={1}
                marks
                min={1}
                max={9}
                valueLabelDisplay="auto"
                aria-labelledby="kp-threshold-slider"
              />
              <Typography variant="body2" color="text.secondary">
                You will receive alerts when the Kp index reaches or exceeds this value.
              </Typography>
            </Box>
            
            <FormGroup sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                  />
                }
                label="Email Alerts"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={pushNotifications}
                    onChange={(e) => setPushNotifications(e.target.checked)}
                  />
                }
                label="Push Notifications"
              />
            </FormGroup>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="alert-frequency-label">Alert Frequency</InputLabel>
              <Select
                labelId="alert-frequency-label"
                id="alert-frequency"
                value={alertFrequency}
                label="Alert Frequency"
                onChange={(e) => setAlertFrequency(e.target.value as 'immediately' | 'daily' | 'weekly')}
              >
                <MenuItem value="immediately">Immediately</MenuItem>
                <MenuItem value="daily">Daily Digest</MenuItem>
                <MenuItem value="weekly">Weekly Summary</MenuItem>
              </Select>
            </FormControl>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Locations
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" paragraph>
                Add locations to receive aurora viewing opportunities specific to your area.
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    label="Add Location"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="City, Country"
                  />
                </Grid>
                <Grid item xs={4}>
                  <Button
                    variant="contained"
                    onClick={handleAddLocation}
                    disabled={!newLocation}
                    fullWidth
                    sx={{ height: '100%' }}
                  >
                    Add
                  </Button>
                </Grid>
              </Grid>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              {locations.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No locations added yet.
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {locations.map((location) => (
                    <Chip
                      key={location}
                      label={location}
                      onDelete={() => handleRemoveLocation(location)}
                    />
                  ))}
                </Box>
              )}
            </Box>
            
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <LoadingButton
                loading={isUpdating}
                variant="contained"
                onClick={handleSaveSettings}
              >
                Save Settings
              </LoadingButton>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
