// src/hooks/useNoaaMagData.js
import { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchMagData, MagData } from '../api/noaaApi';

const NOAA_MAG_URL = 'https://services.swpc.noaa.gov/products/solar-wind/mag-1-day.json';
const MAX_DATA_POINTS = 1000; // Limit the maximum number of data points

// Define the expected structure of the data array
type NoaaMagData = string[][];

export function useNoaaMagData() {
    const [data, setData] = useState<MagData[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const data = await fetchMagData();
            setData(data as MagData[]);
        } catch (error) {
            console.error('Error fetching NOAA magnetic field data:', error);
            setError('Failed to fetch data');
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