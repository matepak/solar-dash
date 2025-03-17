import { useState, useEffect } from 'react';

interface AuroraImage {
    id: string;
    url: string;
    title: string;
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
                    { id: '1', url: '/aurora1.jpg', title: 'Aurora Borealis 1' },
                    { id: '2', url: '/aurora2.jpg', title: 'Aurora Borealis 2' },
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