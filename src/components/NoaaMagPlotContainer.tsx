import React, { useMemo } from 'react';
import { useNoaaMagData } from '../hooks/useNoaaMagData'; // Adjust path
import MagneticFieldPlot from './MagneticFieldPlot'; // Adjust path
import { Paper } from '@mui/material';

function NoaaMagPlotContainer() {
    // Use the custom hook to get data and state
    const { data: rawData, isLoading, error } = useNoaaMagData();

    // Process the raw data only when it changes
    // This useMemo hook optimizes performance by memoizing the plotData calculation
    // It only recalculates when rawData, isLoading, or error values change
    const plotData = useMemo(() => {
        // Skip processing if data is still loading, there's an error, or no data is available
        if (isLoading || error || !rawData) {
            return null; // Return null to indicate no data to plot
        }

        // Transform the MagData[] array from the API into the PlotData format required by MagneticFieldPlot
        // Each property extracts the corresponding values from all data points into separate arrays
        return {
            timeTag: rawData.map(d => d.timeTag),     // Array of timestamps
            bx_gsm: rawData.map(d => d.bx_gsm),       // X component of magnetic field in GSM coordinates
            by_gsm: rawData.map(d => d.by_gsm),       // Y component of magnetic field in GSM coordinates
            bz_gsm: rawData.map(d => d.bz_gsm),       // Z component of magnetic field in GSM coordinates
            lon_gsm: rawData.map(d => d.lon_gsm),     // Longitude in GSM coordinates
            lat_gsm: rawData.map(d => d.lat_gsm),     // Latitude in GSM coordinates
            bt: rawData.map(d => d.bt)                // Total magnetic field strength
        };
    }, [rawData, isLoading, error]); // Dependencies that trigger recalculation when changed

    // --- Render based on state ---
    if (isLoading) {
        return <div>Loading NOAA Magnetic Field Data...</div>;
    }

    if (error) {
        return <div>Error loading data: {error}</div>;
    }

    // Pass the processed plotData to the presentation component
    return (
        <Paper sx={{ p: 2, boxShadow: 3 }}>
            <div>
                <h2>NOAA SWPC Magnetic Field (Last 24 Hours)</h2>
                {plotData ? (
                    <MagneticFieldPlot plotData={plotData} />
                ) : (
                    <div>Could not process plot data.</div> // Handle processing errors
                )}
            </div>
        </Paper>
    );
}

export default NoaaMagPlotContainer;