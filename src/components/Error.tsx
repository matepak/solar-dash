import React from 'react';
import { Box, Typography, Alert } from '@mui/material';

const Error: React.FC = () => (
    <Box p={3}>
        <Alert severity="error">
            <Typography>An error occurred while loading the data.</Typography>
        </Alert>
    </Box>
);

export default Error; 