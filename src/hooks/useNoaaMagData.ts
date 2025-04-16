// src/hooks/useNoaaMagData.js
import { useState, useEffect, useCallback } from 'react';
import { fetchMagData, fetchPlasmaData, PlasmaData, MagData, calculateSolarWindPropagationTime } from '../api/noaaApi';

const MAX_DATA_POINTS = 1000; // Limit the maximum number of data points

export function useNoaaMagData() {
    const [data, setData] = useState<MagData[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const data = await fetchMagData();
            // Only keep the most recent MAX_DATA_POINTS
            const limitedData = data.slice(-MAX_DATA_POINTS);
            setData(limitedData as MagData[]);
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
                await calculateSolarWindPropagationTime().then(propagationTime => {
                    console.log('propagationTime: ', propagationTime);
                });
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