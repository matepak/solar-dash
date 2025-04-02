import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardMedia,
  CardContent,
  Button,
  Grid,
  useTheme,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { useSolarImages } from '../hooks/useSolarImages';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

export const SolarImageViewer: React.FC = () => {
  const { images, loading, error, refetch, getImageUrl } = useSolarImages();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedResolution, setSelectedResolution] = useState('512');
  const theme = useTheme();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => refetch()}>Retry</Button>}>
          {error.message}
        </Alert>
      </Box>
    );
  }

  if (!images.length) {
    return (
      <Box p={2}>
        <Alert severity="info">No solar images available.</Alert>
      </Box>
    );
  }

  const selectedImage = images[selectedIndex];
  const imageUrl = getImageUrl(selectedImage, selectedResolution);

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <Paper sx={{ p: 2, boxShadow: 3 }}>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h2">
            Solar Dynamics Observatory Images
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Resolution</InputLabel>
            <Select
              value={selectedResolution}
              label="Resolution"
              onChange={(e) => {
                setSelectedResolution(e.target.value);
                refetch(e.target.value);
              }}
            >
              <MenuItem value="4096">4096x4096</MenuItem>
              <MenuItem value="2048">2048x2048</MenuItem>
              <MenuItem value="1024">1024x1024</MenuItem>
              <MenuItem value="512">512x512</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Card sx={{ mb: 2 }}>
          <Box position="relative" sx={{ bgcolor: 'black' }}>
            <CardMedia
              component="img"
              image={imageUrl}
              alt={selectedImage.title}
              sx={{
                height: 500,
                objectFit: 'contain',
                bgcolor: 'black'
              }}
            />
            <Button
              onClick={handlePrevious}
              sx={{
                position: 'absolute',
                left: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(0,0,0,0.5)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.7)'
                }
              }}
            >
              <ChevronLeft />
            </Button>
            <Button
              onClick={handleNext}
              sx={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(0,0,0,0.5)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.7)'
                }
              }}
            >
              <ChevronRight />
            </Button>
          </Box>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {selectedImage.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {selectedImage.description}
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip label={`Channel: ${selectedImage.channel}`} />
              <Chip label={`Resolution: ${selectedImage.resolution}x${selectedImage.resolution}`} />
            </Box>
          </CardContent>
        </Card>

        <Grid container spacing={2}>
          {images.map((image, index) => (
            <Grid item xs={12} sm={6} md={4} key={image.channel}>
              <Card
                sx={{
                  cursor: 'pointer',
                  border: index === selectedIndex ? `2px solid ${theme.palette.primary.main}` : 'none'
                }}
                onClick={() => setSelectedIndex(index)}
              >
                <CardMedia
                  component="img"
                  image={getImageUrl(image, selectedResolution)}
                  alt={image.title}
                  sx={{ height: 200, objectFit: 'contain', bgcolor: 'black' }}
                />
                <CardContent>
                  <Typography variant="subtitle2" noWrap>
                    {image.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {image.channel}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box mt={2} textAlign="center">
          <Typography variant="caption" color="text.secondary">
            Images provided by NASA's Solar Dynamics Observatory (SDO)
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};
