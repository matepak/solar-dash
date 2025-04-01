// src/components/MagneticFieldPlot.js
import React, { useMemo, useCallback } from 'react';
import Plot from 'react-plotly.js';
import { Data, Layout } from 'plotly.js';

interface PlotData {
    time: Date[];
    bx: number[];
    by: number[];
    bz: number[];
    lon: number[];
    lat: number[];
    bt: number[];
    clockAngle: number[];
}

// Helper function to aggregate data points
const aggregateData = (data: any[], targetPoints: number) => {
    if (!data || data.length <= targetPoints) return data || []; // Ensure array return

    const interval = Math.ceil(data.length / targetPoints);
    const aggregated: any[] = []; // Keep type flexible for now

    for (let i = 0; i < data.length; i += interval) {
        const chunk = data.slice(i, i + interval);
        // Simplified aggregation for example - original logic had issues, may need refinement
        // This example takes the first element or calculates avg for numbers
        if (chunk.length > 0 && chunk[0] instanceof Date) {
            aggregated.push(chunk[0]); // Example: take first date
        } else {
            let validSum = 0;
            let validCount = 0;
            chunk.forEach(val => {
                const num = Number(val);
                if (!isNaN(num)) {
                    validSum += num;
                    validCount++;
                }
            });
            aggregated.push(validCount > 0 ? validSum / validCount : NaN);
        }
    }

    return aggregated;
};

function MagneticFieldPlot({ plotData }: { plotData: PlotData | null | undefined }) {

    // Memoize aggregated data - MOVED BEFORE CONDITIONAL RETURN
    const aggregatedData = useMemo(() => {
        if (!plotData) {
            // Return default structure if plotData is not available
            return {
                time: [], bx: [], by: [], bz: [], lon: [], lat: [], bt: [], clockAngle: []
            };
        }
        const targetPoints = 200; // Target number of points for each series
        return {
            time: aggregateData(plotData.time, targetPoints),
            bx: aggregateData(plotData.bx, targetPoints),
            by: aggregateData(plotData.by, targetPoints),
            bz: aggregateData(plotData.bz, targetPoints),
            lon: aggregateData(plotData.lon, targetPoints),
            lat: aggregateData(plotData.lat, targetPoints),
            bt: aggregateData(plotData.bt, targetPoints),
            clockAngle: aggregateData(plotData.clockAngle, targetPoints)
        };
    }, [plotData]);

    // Memoize plot data - MOVED
    const dataTimeSeries: Data[] = useMemo(() => [
        {
            x: aggregatedData.time,
            y: aggregatedData.bx,
            type: 'scatter',
            mode: 'lines',
            name: 'Bx GSM',
            line: { color: 'blue', width: 1 },
            yaxis: 'y1',
            connectgaps: false
        },
        {
            x: aggregatedData.time,
            y: aggregatedData.by,
            type: 'scatter',
            mode: 'lines',
            name: 'By GSM',
            line: { color: 'green', width: 1 },
            yaxis: 'y1',
            connectgaps: false
        },
        {
            x: aggregatedData.time,
            y: aggregatedData.bz,
            type: 'scatter',
            mode: 'lines',
            name: 'Bz GSM',
            line: { color: 'red', width: 1 },
            yaxis: 'y1',
            connectgaps: false
        },
        {
            x: aggregatedData.time,
            y: aggregatedData.bt,
            type: 'scatter',
            mode: 'lines',
            name: 'Bt',
            line: { color: 'black', width: 1 },
            yaxis: 'y2',
            connectgaps: false
        },
        {
            x: aggregatedData.time,
            y: aggregatedData.lon,
            type: 'scatter',
            mode: 'lines',
            name: 'Longitude GSM',
            line: { color: 'purple', width: 1 },
            yaxis: 'y3',
            connectgaps: false
        },
        {
            x: aggregatedData.time,
            y: aggregatedData.lat,
            type: 'scatter',
            mode: 'lines',
            name: 'Latitude GSM',
            line: { color: 'orange', width: 1 },
            yaxis: 'y4',
            connectgaps: false
        },
    ], [aggregatedData]);

    // Memoize clock angle data - MOVED
    const dataClockAngle: Data[] = useMemo(() => [{
        x: aggregatedData.time,
        y: aggregatedData.clockAngle,
        type: 'scatter',
        mode: 'markers',
        name: 'Clock Angle',
        marker: { color: 'cyan', size: 3 },
        connectgaps: false,
    }], [aggregatedData]);

    // Memoize layouts - MOVED
    const layoutTimeSeries: Partial<Layout> = useMemo(() => ({
        height: 700,
        grid: { rows: 4, columns: 1, pattern: 'independent', roworder: 'top to bottom' },
        xaxis: { anchor: 'y4', showgrid: true, gridcolor: '#ddd', tickformat: '%H:%M\n%Y-%m-%d' },
        yaxis: { domain: [0.75, 1.0], title: 'B (nT)', showgrid: true, gridcolor: '#ddd', zeroline: true, zerolinecolor: '#999', zerolinewidth: 1 },
        yaxis2: { domain: [0.5, 0.75], title: 'Bt (nT)', showgrid: true, gridcolor: '#ddd' },
        yaxis3: { domain: [0.25, 0.5], title: 'Lon (°)', showgrid: true, gridcolor: '#ddd' },
        yaxis4: { domain: [0, 0.25], title: 'Lat (°)', showgrid: true, gridcolor: '#ddd', zeroline: true, zerolinecolor: '#999', zerolinewidth: 1 },
        showlegend: true,
        legend: { orientation: 'h', x: 1, y: 1.02, xanchor: 'right', yanchor: 'bottom' },
        margin: { l: 30, r: 30, t: 50, b: 50 },
        hovermode: 'x unified',
    }), []);

    // Memoize clock angle layout - MOVED
    const layoutClockAngle: Partial<Layout> = useMemo(() => ({
        title: 'Magnetic Field Clock Angle (arctan2(By, Bz))',
        height: 250,
        xaxis: { showgrid: true, gridcolor: '#ddd', tickformat: '%H:%M\n%Y-%m-%d' },
        yaxis: {
            title: 'Clock Angle (°)',
            range: [-180, 180],
            tickvals: [-180, -135, -90, -45, 0, 45, 90, 135, 180],
            showgrid: true, gridcolor: '#ddd', zeroline: true, zerolinecolor: '#999', zerolinewidth: 1
        },
        shapes: aggregatedData.time.length > 0 ? [
            { type: 'line', x0: aggregatedData.time[0], y0: 90, x1: aggregatedData.time[aggregatedData.time.length - 1], y1: 90, line: { color: 'grey', width: 1, dash: 'dot' } },
            { type: 'line', x0: aggregatedData.time[0], y0: -90, x1: aggregatedData.time[aggregatedData.time.length - 1], y1: -90, line: { color: 'grey', width: 1, dash: 'dot' } },
            { type: 'line', x0: aggregatedData.time[0], y0: 180, x1: aggregatedData.time[aggregatedData.time.length - 1], y1: 180, line: { color: 'grey', width: 1, dash: 'dot' } },
            { type: 'line', x0: aggregatedData.time[0], y0: -180, x1: aggregatedData.time[aggregatedData.time.length - 1], y1: -180, line: { color: 'grey', width: 1, dash: 'dot' } },
        ] : [],
        showlegend: true,
        legend: { x: 1.02, y: 1, xanchor: 'left' },
        margin: { l: 60, r: 80, t: 50, b: 50 },
        hovermode: 'closest',
    }), [aggregatedData.time]);

    // Conditional rendering based on plotData still happens here
    if (!plotData) {
        return <div>No data available to plot.</div>;
    }

    // Hooks are defined above, component returns JSX using memoized values
    return (
        <div>
            <Plot
                data={dataTimeSeries}
                layout={layoutTimeSeries}
                useResizeHandler={true}
                style={{ width: '100%', height: '100%' }}
                config={{ responsive: true }}
            />
            {/* <Plot
                data={dataClockAngle}
                layout={layoutClockAngle}
                useResizeHandler={true}
                style={{ width: '100%', height: '100%' }}
                config={{ responsive: true }}
            /> */}
        </div>
    );
}

// Helper function for angle normalization
const normalizeAngle = (degrees: number) => {
    degrees = degrees % 360;
    if (degrees <= -180) {
        degrees += 360;
    } else if (degrees > 180) {
        degrees -= 360;
    }
    return degrees;
};

// Memoized processing function
export const processNoaaMagData = (rawData: string[][]) => {
    if (!rawData) {
        return null;
    }

    const headers = rawData[0];
    const rows = rawData.slice(1);

    const time: Date[] = [];
    const bx: number[] = [];
    const by: number[] = [];
    const bz: number[] = [];
    const lon: number[] = [];
    const lat: number[] = [];
    const bt: number[] = [];
    const clockAngle: number[] = [];

    const colIndices = {
        time_tag: headers.indexOf('time_tag'),
        bx_gsm: headers.indexOf('bx_gsm'),
        by_gsm: headers.indexOf('by_gsm'),
        bz_gsm: headers.indexOf('bz_gsm'),
        lon_gsm: headers.indexOf('lon_gsm'),
        lat_gsm: headers.indexOf('lat_gsm'),
        bt: headers.indexOf('bt'),
    };

    if (Object.values(colIndices).some(index => index === -1)) {
        console.error("Required columns missing in NOAA data headers during processing:", headers);
        return null;
    }

    try {
        rows.forEach(row => {
            const timeStr = row[colIndices.time_tag];
            const bxVal = row[colIndices.bx_gsm] === null ? NaN : parseFloat(row[colIndices.bx_gsm]);
            const byVal = row[colIndices.by_gsm] === null ? NaN : parseFloat(row[colIndices.by_gsm]);
            const bzVal = row[colIndices.bz_gsm] === null ? NaN : parseFloat(row[colIndices.bz_gsm]);
            const lonVal = row[colIndices.lon_gsm] === null ? NaN : parseFloat(row[colIndices.lon_gsm]);
            const latVal = row[colIndices.lat_gsm] === null ? NaN : parseFloat(row[colIndices.lat_gsm]);
            const btVal = row[colIndices.bt] === null ? NaN : parseFloat(row[colIndices.bt]);

            if (timeStr && !isNaN(Date.parse(timeStr))) {
                time.push(new Date(timeStr));
                bx.push(bxVal);
                by.push(byVal);
                bz.push(bzVal);
                lon.push(lonVal);
                lat.push(latVal);
                bt.push(btVal);

                if (!isNaN(byVal) && !isNaN(bzVal)) {
                    const angleRad = Math.atan2(byVal, bzVal);
                    clockAngle.push(normalizeAngle(angleRad * (180 / Math.PI)));
                } else {
                    clockAngle.push(NaN);
                }
            } else {
                console.warn(`Skipping row due to invalid time_tag: ${timeStr}`, row);
            }
        });
        return { time, bx, by, bz, lon, lat, bt, clockAngle };
    } catch (error) {
        console.error("Error processing NOAA data for plotting:", error);
        return null;
    }
};

export default React.memo(MagneticFieldPlot);