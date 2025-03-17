import React from 'react';
import { 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Typography, 
  CircularProgress, 
  Alert,
  Box
} from '@mui/material';
import { format } from 'date-fns';
import { useKpForecastData } from '../hooks/useKpForecastData';
import { mapKpToColor } from '../api/noaaApi';

interface KpForecastTableProps {
  className?: string;
}

const KpForecastTable: React.FC<KpForecastTableProps> = ({ className }) => {
  const { data, loading, error } = useKpForecastData();
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load Kp Index forecast data. Please try again later.
      </Alert>
    );
  }
  
  // No data available
  if (data.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No forecast data available at this time.
      </Alert>
    );
  }
  
  return (
    <Paper className={className} sx={{ width: '100%', overflow: 'hidden' }}>
      <Typography variant="h6" sx={{ p: 2, pb: 0 }}>
        Kp Index Forecast
      </Typography>
      
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="kp forecast table">
          <TableHead>
            <TableRow>
              <TableCell>Date & Time</TableCell>
              <TableCell>Kp Value</TableCell>
              <TableCell>NOAA Scale</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => {
              const kpColor = mapKpToColor(row.kpValue);
              return (
                <TableRow key={index} hover>
                  <TableCell>
                    {format(new Date(row.timeTag), 'MMM dd, yyyy HH:mm')}
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: kpColor,
                      color: kpColor === 'yellow' || kpColor === 'green' ? 'black' : 'white',
                      fontWeight: 'bold'
                    }}
                  >
                    {row.kpValue.toFixed(1)}
                  </TableCell>
                  <TableCell>{row.noaaScale}</TableCell>
                  <TableCell sx={{ textTransform: 'capitalize' }}>
                    {row.observed}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Forecast data is provided by NOAA Space Weather Prediction Center. "Estimated" indicates 
          current estimation based on real-time data, while "Predicted" indicates forecast for
          upcoming periods.
        </Typography>
      </Box>
    </Paper>
  );
};

export default KpForecastTable;
