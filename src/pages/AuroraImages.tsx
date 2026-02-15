import React, { useState } from 'react';
import { Box, Typography, Grid, Card, CardActionArea, CardMedia, CardContent, Paper } from '@mui/material';
import { useAuroraImages, AuroraImage } from '../hooks/useAuroraImages';
import Loading from '../components/Loading';
import Error from '../components/Error';
import { AuroraImageViewer } from '../components/AuroraImageViewer'; // Correctly import as a named export


const AuroraImages: React.FC = () => {
    const { images, loading, error } = useAuroraImages();
    const [selectedImage, setSelectedImage] = useState<AuroraImage | null>(null);

    const handleImageClick = (image: AuroraImage) => {
        setSelectedImage(image);
    };

    const handleCloseViewer = () => {
        setSelectedImage(null);
    };

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
                    Aurora Live Images
                </Typography>
                <Grid container spacing={3}>
                    {images.map((image) => (
                        <Grid item xs={12} md={6} lg={4} key={image.id}>
                            <Card>
                                <CardActionArea onClick={() => handleImageClick(image)}>
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image={image.url}
                                        alt={image.title}
                                        sx={{ objectFit: 'cover' }}
                                    />
                                    <CardContent>
                                        <Typography variant="h6" component="h2">
                                            {image.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {image.description}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <AuroraImageViewer
                    open={!!selectedImage}
                    onClose={handleCloseViewer}
                    imageUrl={selectedImage?.url}
                    title={selectedImage?.title}
                />
            </Box>
        </Paper>
    );
};

export default AuroraImages;
