import React from 'react';
import { Box, Typography, Grid, Card, CardActionArea, CardMedia, CardContent, Paper } from '@mui/material';
import { useAuroraImages } from '../hooks/useAuroraImages';
import Loading from '../components/Loading';
import Error from '../components/Error';
//import { AuroraImageViewer } from '../components/AuroraImageViewer';


const AuroraImages: React.FC = () => {
    const { images, loading, error } = useAuroraImages();

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <Error />;
    }

    return (
        <Paper sx={{ p: 2, boxShadow: 3 }}>
            <Box sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Aurora Images
                </Typography>
                <Grid container spacing={3}>
                    {images.map((image) => (
                        <Grid item xs={12} md={6} lg={4} key={image.id}>
                            <Card>
                                <CardActionArea>
                                    <CardMedia component="img" image={image.url} alt={image.title} />
                                    <CardContent>
                                        <Typography variant="h6" component="h2">
                                            {image.title}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Paper>
    );
};

export default AuroraImages;
