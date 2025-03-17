import { useState, useEffect } from 'react';
import { fetchLatestSolarImages, getEpicImageUrl, SolarImage } from '../api/solarDataApi';

interface SolarImagesHook {
  images: SolarImage[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  getImageUrl: (image: SolarImage) => string;
}

export const useSolarImages = (): SolarImagesHook => {
  const [images, setImages] = useState<SolarImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const solarImages = await fetchLatestSolarImages();

      // Only update state if we got some images
      if (solarImages.length > 0) {
        setImages(solarImages);
      } else {
        setError(new Error('No solar images available'));
      }
    } catch (err: any) {
      setError(err);
      console.error('Error in useSolarImages hook:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchData();

    // Set up a refresh interval - every 6 hours
    const intervalId = setInterval(() => {
      fetchData();
    }, 6 * 60 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  return {
    images,
    loading,
    error,
    refetch: fetchData,
    getImageUrl: getEpicImageUrl
  };
};
