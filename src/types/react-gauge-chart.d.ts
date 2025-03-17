declare module 'react-gauge-chart' {
    interface GaugeChartProps {
        id: string;
        nrOfLevels: number;
        colors: string[];
        arcWidth: number;
        percent: number;
        textColor?: string;
        needleColor?: string;
        needleBaseColor?: string;
        formatTextValue?: () => string;
    }

    const GaugeChart: React.FC<GaugeChartProps>;
    export default GaugeChart;
} 