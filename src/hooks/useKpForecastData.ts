import { useState, useEffect } from 'react';
import { fetchKpForecastData, KpForecastData } from '../api/noaaApi';

interface KpForecastDataHook {
  data: KpForecastData[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  maxForecastedKp: number;
}

export const useKpForecastData = (): KpForecastDataHook => {
  const [data, setData] = useState<KpForecastData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const forecastData = await fetchKpForecastData();
      setData(forecastData);
    } catch (err: any) {
      setError(err);
      console.error('Error in useKpForecastData hook:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchData();
    
    // Set up a refresh interval - every 1 hour
    const intervalId = setInterval(() => {
      fetchData();
    }, 60 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Calculate the maximum forecasted Kp value
  const maxForecastedKp = data.length > 0 
    ? Math.max(...data.map(item => item.kpValue))
    : 0;

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    maxForecastedKp
  };
};
