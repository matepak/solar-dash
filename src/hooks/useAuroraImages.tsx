import { useState, useEffect } from 'react';

export interface AuroraImage {
    id: string;
    url: string;
    title: string;
    description: string;
}

export const useAuroraImages = () => {
    const [images, setImages] = useState<AuroraImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                // TODO: Replace with actual API call
                const mockImages: AuroraImage[] = [
                    { id: '1', url: 'https://kho.unis.no/SD/pics/cam3a.jpg', title: 'Adventdalen, Norway' , description: 'source: https://kho.unis.no/WebCameras.html' },
                    { id: '2', url: 'https://mtwellington-images.hobartcity.com.au/images/platform.jpg', title: 'Hobart, Australia' , description: 'source: https://www.hobartcity.com.au/' },
                ];
                setImages(mockImages);
                setLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch images'));
                setLoading(false);
            }
        };

        fetchImages();
    }, []);

    return { images, loading, error };
}; 