import React from 'react';
import { Box, CircularProgress } from '@mui/material';

const Loading: React.FC = () => (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
    </Box>
);

export default Loading; 