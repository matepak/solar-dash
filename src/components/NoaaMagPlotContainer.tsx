import React, { useMemo } from 'react';
import { useNoaaMagData } from '../hooks/useNoaaMagData'; // Adjust path
import MagneticFieldPlot, { processNoaaMagData } from './MagneticFieldPlot'; // Adjust path

function NoaaMagPlotContainer() {
    // Use the custom hook to get data and state
    const { data: rawData, isLoading, error } = useNoaaMagData();

    // Process the raw data only when it changes
    const plotData = useMemo(() => {
        if (isLoading || error || !rawData) {
            return null; // Don't process if loading, errored, or no data
        }
        return processNoaaMagData(rawData);
    }, [rawData, isLoading, error]); // Dependencies include state from hook

    // --- Render based on state ---
    if (isLoading) {
        return <div>Loading NOAA Magnetic Field Data...</div>;
    }

    if (error) {
        return <div>Error loading data: {error}</div>;
    }

    // Pass the processed plotData to the presentation component
    return (
        <div>
            <h2>NOAA SWPC Magnetic Field (Last 24 Hours)</h2>
            {plotData ? (
                <MagneticFieldPlot plotData={plotData} />
            ) : (
                <div>Could not process plot data.</div> // Handle processing errors
            )}
        </div>
    );
}

export default NoaaMagPlotContainer;