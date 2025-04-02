// src/components/MagneticFieldPlot.js
import React, { useMemo, useCallback } from 'react';
import Plot from 'react-plotly.js';
import { Data, Layout } from 'plotly.js';

interface PlotData {
    timeTag: Date[];
    bx_gsm: number[];
    by_gsm: number[];
    bz_gsm: number[];
    lon_gsm: number[];
    lat_gsm: number[];
    bt: number[];
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
                timeTag: [], bx_gsm: [], by_gsm: [], bz_gsm: [], lon_gsm: [], lat_gsm: [], bt: []
            };
        }
        const targetPoints = 200; // Target number of points for each series
        return {
            timeTag: aggregateData(plotData.timeTag, targetPoints),
            bx_gsm: aggregateData(plotData.bx_gsm, targetPoints),
            by_gsm: aggregateData(plotData.by_gsm, targetPoints),
            bz_gsm: aggregateData(plotData.bz_gsm, targetPoints),
            lon_gsm: aggregateData(plotData.lon_gsm, targetPoints),
            lat_gsm: aggregateData(plotData.lat_gsm, targetPoints),
            bt: aggregateData(plotData.bt, targetPoints),
        };
    }, [plotData]);

    // Memoize plot data - MOVED
    const dataTimeSeries: Data[] = useMemo(() => [
        {
            x: aggregatedData.timeTag,
            y: aggregatedData.bx_gsm,
            type: 'scatter',
            mode: 'lines',
            name: 'Bx GSM',
            line: { color: 'blue', width: 1 },
            yaxis: 'y1',
            connectgaps: false
        },
        {
            x: aggregatedData.timeTag,
            y: aggregatedData.by_gsm,
            type: 'scatter',
            mode: 'lines',
            name: 'By GSM',
            line: { color: 'green', width: 1 },
            yaxis: 'y1',
            connectgaps: false
        },
        {
            x: aggregatedData.timeTag,
            y: aggregatedData.bz_gsm,
            type: 'scatter',
            mode: 'lines',
            name: 'Bz GSM',
            line: { color: 'red', width: 1 },
            yaxis: 'y1',
            connectgaps: false
        },
        {
            x: aggregatedData.timeTag,
            y: aggregatedData.bt,
            type: 'scatter',
            mode: 'lines',
            name: 'Bt',
            line: { color: 'black', width: 1 },
            yaxis: 'y2',
            connectgaps: false
        },
        {
            x: aggregatedData.timeTag,
            y: aggregatedData.lon_gsm,
            type: 'scatter',
            mode: 'lines',
            name: 'Longitude GSM',
            line: { color: 'purple', width: 1 },
            yaxis: 'y3',
            connectgaps: false
        },
        {
            x: aggregatedData.timeTag,
            y: aggregatedData.lat_gsm,
            type: 'scatter',
            mode: 'lines',
            name: 'Latitude GSM',
            line: { color: 'orange', width: 1 },
            yaxis: 'y4',
            connectgaps: false
        },
    ], [aggregatedData]);

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
        shapes: aggregatedData.timeTag.length > 0 ? [
            { type: 'line', x0: aggregatedData.timeTag[0], y0: 90, x1: aggregatedData.timeTag[aggregatedData.timeTag.length - 1], y1: 90, line: { color: 'grey', width: 1, dash: 'dot' } },
            { type: 'line', x0: aggregatedData.timeTag[0], y0: -90, x1: aggregatedData.timeTag[aggregatedData.timeTag.length - 1], y1: -90, line: { color: 'grey', width: 1, dash: 'dot' } },
            { type: 'line', x0: aggregatedData.timeTag[0], y0: 180, x1: aggregatedData.timeTag[aggregatedData.timeTag.length - 1], y1: 180, line: { color: 'grey', width: 1, dash: 'dot' } },
            { type: 'line', x0: aggregatedData.timeTag[0], y0: -180, x1: aggregatedData.timeTag[aggregatedData.timeTag.length - 1], y1: -180, line: { color: 'grey', width: 1, dash: 'dot' } },
        ] : [],
        showlegend: true,
        legend: { x: 1.02, y: 1, xanchor: 'left' },
        margin: { l: 60, r: 80, t: 50, b: 50 },
        hovermode: 'closest',
    }), [aggregatedData.timeTag]);

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
        </div>
    );
}

export default React.memo(MagneticFieldPlot);