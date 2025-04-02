import { useState, useEffect } from 'react';
import { fetchLatestSolarImages, SolarImage, SDO_BASE_URL } from '../api/solarDataApi';

interface SolarImagesHook {
  images: SolarImage[];
  loading: boolean;
  error: Error | null;
  refetch: (resolution?: string) => Promise<void>;
  getImageUrl: (image: SolarImage, resolution: string) => string;
}

export const useSolarImages = (): SolarImagesHook => {
  const [images, setImages] = useState<SolarImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async (resolution?: string) => {
    try {
      setLoading(true);
      setError(null);

      const solarImages = await fetchLatestSolarImages(resolution);

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

  const getImageUrl = (image: SolarImage, resolution: string) => {
    // Construct filename with the new resolution
    const filename = `latest_${resolution}_${image.channel}.jpg`;
    return `${SDO_BASE_URL}/${filename}`;
  };

  return {
    images,
    loading,
    error,
    refetch: fetchData,
    getImageUrl
  };
};
