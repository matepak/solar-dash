import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    CardMedia,
    Button,
    useTheme,
    Skeleton,
} from '@mui/material';
import { OpenInNew } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { SDO_BASE_URL } from '../api/solarDataApi';

const CHANNEL = 'HMIIF';
const RESOLUTION = '512';

/**
 * Compact dashboard widget showing the latest SDO HMI Intensitygram (Flattened).
 * Links through to the full Solar Images page for more channels / resolutions.
 */
const SolarImageWidget: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [loaded, setLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    const imageUrl = `${SDO_BASE_URL}/latest_${RESOLUTION}_${CHANNEL}.jpg`;

    return (
        <Paper
            sx={{
                p: 2,
                boxShadow: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                }}
            >
                <Typography variant="h6" component="div">
                    SDO Solar Image
                </Typography>
                <Button
                    size="small"
                    endIcon={<OpenInNew fontSize="small" />}
                    onClick={() => navigate('/images')}
                    sx={{ textTransform: 'none', fontSize: '0.8rem' }}
                >
                    All channels
                </Button>
            </Box>

            {/* Image */}
            <Box
                sx={{
                    position: 'relative',
                    flexGrow: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'black',
                    borderRadius: 1,
                    overflow: 'hidden',
                    minHeight: 280,
                }}
            >
                {!loaded && !hasError && (
                    <Skeleton
                        variant="rectangular"
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            bgcolor: 'rgba(255,255,255,0.05)',
                        }}
                    />
                )}

                {hasError ? (
                    <Typography variant="body2" color="text.secondary">
                        Unable to load solar image
                    </Typography>
                ) : (
                    <CardMedia
                        component="img"
                        image={imageUrl}
                        alt="SDO HMI Intensitygram – Flattened"
                        onLoad={() => setLoaded(true)}
                        onError={() => setHasError(true)}
                        sx={{
                            maxHeight: 360,
                            width: '100%',
                            objectFit: 'contain',
                            opacity: loaded ? 1 : 0,
                            transition: 'opacity 0.4s ease',
                        }}
                    />
                )}
            </Box>

            {/* Caption */}
            <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2">
                    HMI Intensitygram – Flattened
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Shows visible-light view of the solar surface with sunspots clearly visible.
                    Updated every ~15 min from NASA SDO.
                </Typography>
            </Box>
        </Paper>
    );
};

export default SolarImageWidget;
