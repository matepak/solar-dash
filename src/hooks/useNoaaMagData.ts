// src/hooks/useNoaaMagData.js
import { useState, useEffect, useMemo, useCallback } from 'react';

const NOAA_MAG_URL = 'https://services.swpc.noaa.gov/products/solar-wind/mag-1-day.json';
const MAX_DATA_POINTS = 1000; // Limit the maximum number of data points

// Define the expected structure of the data array
type NoaaMagData = string[][];

export function useNoaaMagData() {
    const [data, setData] = useState<NoaaMagData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const response = await fetch(NOAA_MAG_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const jsonData = await response.json();

            if (!Array.isArray(jsonData) || jsonData.length < 2) {
                throw new Error('Invalid data format received from NOAA.');
            }

            // Only keep the most recent MAX_DATA_POINTS rows
            const limitedData = [
                jsonData[0], // Keep headers
                ...jsonData.slice(-MAX_DATA_POINTS) // Keep most recent data points
            ];

            setData(limitedData as NoaaMagData);
            setError(null);
        } catch (e: unknown) {
            console.error("Failed to fetch NOAA data:", e);
            const errorMessage = e instanceof Error ? e.message : 'Failed to fetch data';
            setError(errorMessage);
            setData(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        const fetchAndUpdate = async () => {
            if (isMounted) {
                setIsLoading(true);
                await fetchData();
            }
        };

        fetchAndUpdate();

        // Set up a refresh interval - every 5 minutes
        const intervalId = setInterval(fetchAndUpdate, 5 * 60 * 1000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [fetchData]);

    return { data, isLoading, error, refetch: fetchData };
}