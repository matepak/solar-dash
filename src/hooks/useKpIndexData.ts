import { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchKpIndexData, KpIndexData } from '../api/noaaApi';

interface KpIndexDataHook {
  data: KpIndexData[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  currentKpValue: number | null;
  filteredData: (startDate: Date, endDate: Date) => KpIndexData[];
}

const MAX_DATA_POINTS = 1000; // Limit the maximum number of data points stored

export const useKpIndexData = (): KpIndexDataHook => {
  const [data, setData] = useState<KpIndexData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const kpData = await fetchKpIndexData();
      // Only keep the most recent MAX_DATA_POINTS
      const limitedData = kpData.slice(-MAX_DATA_POINTS);
      setData(limitedData);
      setLastFetched(new Date());
    } catch (err: any) {
      setError(err);
      console.error('Error in useKpIndexData hook:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchData();

    // Set up a refresh interval - every 30 minutes
    const intervalId = setInterval(() => {
      fetchData();
    }, 30 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [fetchData]);

  // Get the current Kp value (most recent)
  const currentKpValue = useMemo(() =>
    data.length > 0 ? data[data.length - 1].kpValue : null,
    [data]
  );

  // Filter data by date range with memoization
  const filteredData = useCallback((startDate: Date, endDate: Date): KpIndexData[] => {
    return data.filter(item => {
      const itemDate = new Date(item.timeTag);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }, [data]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    currentKpValue,
    filteredData
  };
};
