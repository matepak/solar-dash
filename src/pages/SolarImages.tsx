import React from 'react';
import { Box, Typography, Grid, Card, CardActionArea, CardMedia, CardContent, Paper } from '@mui/material';
import { useSolarImages } from '../hooks/useSolarImages';
import { SolarImageViewer } from '../components/SolarImageViewer';

const SolarImages: React.FC = () => {
  return (
    <div>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Solar Imagery
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          View the latest images of the sun from NASA's Solar Dynamics Observatory (SDO) and other solar observatories.
        </Typography>
      </Box>

      <SolarImageViewer />

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          About Solar Observations
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                SDO - Solar Dynamics Observatory
              </Typography>
              <Typography variant="body2" paragraph>
                The Solar Dynamics Observatory (SDO) is a NASA mission that has been observing the Sun since 2010. It studies the solar atmosphere on small scales of space and time and in many wavelengths simultaneously.
              </Typography>
              <Typography variant="body2">
                SDO's observations help us understand the Sun's influence on Earth and near-Earth space by studying the solar atmosphere on small scales of space and time and in many wavelengths simultaneously.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Understanding Solar Imagery
              </Typography>
              <Typography variant="body2" paragraph>
                Solar observations help scientists monitor solar activity, including sunspots, solar flares, and coronal mass ejections. These events can trigger geomagnetic storms on Earth, affecting power grids, satellite communications, and creating auroras.
              </Typography>
              <Typography variant="body2">
                By monitoring these images along with the Kp index data, you can better understand the connection between solar activity and geomagnetic effects on Earth.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
};

export default SolarImages;
