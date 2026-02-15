import React, { useState, useRef, useCallback } from 'react';
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
  CardActions,
  IconButton,
  Tooltip,
  Avatar
} from '@mui/material';
import { CameraAlt as CameraAltIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth, app } from '../context/AuthContext';
import { useAlerts } from '../context/AlertsContext';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { alertSettings, updateAlertSettings, loading: alertsLoading, isUpdating } = useAlerts();
  const db = getFirestore(app);
  const isDemoUser = user?.uid === 'demo-user-id';

  const [kpThreshold, setKpThreshold] = useState(alertSettings.kpThreshold);
  const [emailAlerts, setEmailAlerts] = useState(alertSettings.emailAlerts);
  const [pushNotifications, setPushNotifications] = useState(alertSettings.pushNotifications);
  const [alertFrequency, setAlertFrequency] = useState(alertSettings.alertFrequency);
  const [locations, setLocations] = useState<string[]>(alertSettings.locations || []);
  const [newLocation, setNewLocation] = useState('');

  // Profile image state
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load profile image from Firestore (or localStorage for demo user) on mount
  React.useEffect(() => {
    const loadProfileImage = async () => {
      if (!user) return;

      if (isDemoUser) {
        const storedImage = localStorage.getItem('demoUserProfileImage');
        if (storedImage) setProfileImage(storedImage);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().profileImage) {
          setProfileImage(userDoc.data().profileImage);
        } else if (user.photoURL) {
          setProfileImage(user.photoURL);
        }
      } catch (err) {
        console.error('Error loading profile image:', err);
      }
    };

    loadProfileImage();
  }, [user, db, isDemoUser]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      setSaveError('Please select a valid image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSaveError('Image must be smaller than 5MB.');
      return;
    }

    setImageUploading(true);
    setSaveError(null);

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxSize = 200;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > maxSize) {
                height = Math.round((height * maxSize) / width);
                width = maxSize;
              }
            } else {
              if (height > maxSize) {
                width = Math.round((width * maxSize) / height);
                height = maxSize;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.85));
            } else {
              reject(new Error('Could not get canvas context'));
            }
          };
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = e.target?.result as string;
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      // Save to Firestore (or localStorage for demo user)
      if (isDemoUser) {
        localStorage.setItem('demoUserProfileImage', dataUrl);
      } else {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, { profileImage: dataUrl }, { merge: true });
      }
      setProfileImage(dataUrl);
    } catch (error) {
      console.error('Error processing image:', error);
      setSaveError('Failed to process image. Please try again.');
    } finally {
      setImageUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [user, db, isDemoUser]);

  const handleRemoveImage = async () => {
    if (!user) return;

    try {
      if (isDemoUser) {
        localStorage.removeItem('demoUserProfileImage');
      } else {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, { profileImage: null }, { merge: true });
      }
      setProfileImage(null);
    } catch (err) {
      console.error('Error removing profile image:', err);
      setSaveError('Failed to remove profile image.');
    }
  };

  // Update local state when alertSettings are loaded from context
  React.useEffect(() => {
    if (!alertsLoading) {
      setKpThreshold(alertSettings.kpThreshold);
      setEmailAlerts(alertSettings.emailAlerts);
      setPushNotifications(alertSettings.pushNotifications);
      setAlertFrequency(alertSettings.alertFrequency);
      setLocations(alertSettings.locations || []);
    }
  }, [alertSettings, alertsLoading]);

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
                {/* Hidden file input for image selection */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="profile-image-input"
                />

                <Tooltip title="Click to change profile photo">
                  <Box
                    onClick={handleAvatarClick}
                    sx={{
                      position: 'relative',
                      width: 80,
                      height: 80,
                      mb: 2,
                      cursor: 'pointer',
                      '&:hover .avatar-overlay': {
                        opacity: 1,
                      },
                    }}
                  >
                    <Avatar
                      src={profileImage || undefined}
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: 'primary.main',
                        color: 'white',
                        fontSize: '2rem',
                      }}
                    >
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                    </Avatar>

                    {/* Camera overlay on hover */}
                    <Box
                      className="avatar-overlay"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        bgcolor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.2s ease-in-out',
                      }}
                    >
                      {imageUploading ? (
                        <CircularProgress size={24} sx={{ color: 'white' }} />
                      ) : (
                        <CameraAltIcon sx={{ color: 'white', fontSize: 28 }} />
                      )}
                    </Box>
                  </Box>
                </Tooltip>

                {/* Remove image button */}
                {profileImage && (
                  <Tooltip title="Remove profile photo">
                    <IconButton
                      size="small"
                      onClick={handleRemoveImage}
                      sx={{ mb: 1, color: 'text.secondary' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}

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
