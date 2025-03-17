import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  useTheme as useMuiTheme
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, addDays, subDays } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarProps
} from 'recharts';
import { useKpIndexData } from '../hooks/useKpIndexData';

interface KpIndexGraphProps {
  className?: string;
}

const KpIndexGraph: React.FC<KpIndexGraphProps> = ({ className }) => {
  const muiTheme = useMuiTheme();
  const { data, loading, error, filteredData } = useKpIndexData();

  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 2));
  const [endDate, setEndDate] = useState<Date>(new Date());

  // Format data for the chart
  const formatChartData = () => {
    const filtered = filteredData(startDate, endDate);

    return filtered.map(item => ({
      time: format(new Date(item.timeTag), 'HH:mm MM/dd'),
      kp: item.kpValue,
      color: item.color
    }));
  };

  const chartData = formatChartData();

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1.5, boxShadow: 3 }}>
          <Typography variant="body2">Time: {label}</Typography>
          <Typography
            variant="body2"
            sx={{
              color: payload[0].payload.color,
              fontWeight: 'bold'
            }}
          >
            Kp Index: {payload[0].value.toFixed(1)}
          </Typography>
        </Paper>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Failed to load Kp Index data. Please try again later.
      </Alert>
    );
  }

  return (
    <Paper
      className={className}
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap' }}>
        <Typography variant="h6" gutterBottom component="div">
          Kp Index History
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={(newValue) => newValue && setStartDate(newValue)}
            slotProps={{
              textField: {
                size: 'small',
                sx: { maxWidth: '140px' }
              }
            }}
          />
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={(newValue) => newValue && setEndDate(newValue)}
            slotProps={{
              textField: {
                size: 'small',
                sx: { maxWidth: '140px' }
              }
            }}
          />
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, width: '100%', height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 30,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              angle={-45}
              textAnchor="end"
              height={60}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              domain={[0, 9]}
              ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="kp"
              name="Kp Index"
              isAnimationActive={false}
              // Use the color property from the data for each bar
              fill="#8884d8"
              stroke={muiTheme.palette.mode === 'dark' ? '#fff' : '#000'}
              strokeWidth={0.5}
              // Custom color for each bar
              shape={(props: BarProps) => {
                const { x, y, width, height, color } = props;
                return (
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={color}
                    stroke={muiTheme.palette.mode === 'dark' ? '#fff' : '#000'}
                    strokeWidth={0.5}
                  />
                );
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default KpIndexGraph;
