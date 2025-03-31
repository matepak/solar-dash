import axios from 'axios';

// Base URL for SDO images
export const SDO_BASE_URL = process.env.REACT_APP_SDO_BASE_URL || 'https://sdo.gsfc.nasa.gov/assets/img/latest';
const SDO_CHANNELS = ['0094', '0131', '0171', '0193', '0211', '0304', '0335', '1600', '1700', 'HMIB', 'HMII', 'HMID', 'HMIBC', 'HMIIF', 'HMIIC'];
const SDO_RESOLUTIONS = ['4096', '2048', '1024', '512'];

// API URL for NASA APOD (used for SDO latest image info)
const SDO_LATEST_URL = process.env.REACT_APP_APOD_URL || 'https://api.nasa.gov/planetary/apod';
const NASA_API_KEY = process.env.REACT_APP_NASA_API_KEY || 'DEMO_KEY';

// Types for solar data
export interface SolarFlare {
  flareID: string;
  beginTime: Date;
  maxTime: Date;
  endTime: Date;
  classType: string;
  sourceLocation: string;
  activeRegionNum: number;
  linkedEvents?: string[];
}

export interface SolarImage {
  channel: string;
  resolution: string;
  url: string;
  title: string;
  description: string;
}

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to get channel description
const getChannelDescription = (channel: string): string => {
  const descriptions: { [key: string]: string } = {
    '0094': 'Fe IX/X 171Å - Extreme Ultraviolet',
    '0131': 'Fe VIII 131Å - Extreme Ultraviolet',
    '0171': 'Fe IX 171Å - Extreme Ultraviolet',
    '0193': 'Fe XII 193Å - Extreme Ultraviolet',
    '0211': 'Fe XIV 211Å - Extreme Ultraviolet',
    '0304': 'He II 304Å - Extreme Ultraviolet',
    '0335': 'Fe XVI 335Å - Extreme Ultraviolet',
    '1600': 'C IV 1600Å - Near Ultraviolet',
    '1700': 'Continuum 1700Å - Near Ultraviolet',
    'HMIB': 'HMI Magnetogram',
    'HMII': 'HMI Intensitygram',
    'HMID': 'HMI Dopplergram',
    'HMIBC': 'HMI Colorized Magnetogram',
    'HMIIF': 'HMI Intensitygram - Flattened',
    'HMIIC': 'HMI Intensitygram - Colorized'
  };
  return descriptions[channel] || channel;
};

// Function to fetch latest solar images from SDO
export const fetchLatestSolarImages = async (resolution: string = '512'): Promise<SolarImage[]> => {
  try {
    const images: SolarImage[] = [];

    // Fetch images for each channel
    for (const channel of SDO_CHANNELS) {
      const filename = `latest_${resolution}_${channel}.jpg`;
      const url = `${SDO_BASE_URL}/${filename}`;

      images.push({
        channel,
        resolution,
        url,
        title: `SDO ${channel} Channel`,
        description: getChannelDescription(channel)
      });
    }

    return images;
  } catch (error) {
    console.error('Error fetching solar images:', error);
    throw error;
  }
};

// Function to get the image URL
export const getEpicImageUrl = (image: SolarImage): string => {
  return image.url;
};

// Function to fetch recent solar flares
export const fetchRecentSolarFlares = async (): Promise<SolarFlare[]> => {
  try {
    // This is a placeholder as NOAA's flare API is different
    // In a real app, you'd implement this using the actual NOAA API for solar flares
    const mockFlares: SolarFlare[] = [
      {
        flareID: 'FLR20240316_001',
        beginTime: new Date('2024-03-16T10:25:00Z'),
        maxTime: new Date('2024-03-16T10:45:00Z'),
        endTime: new Date('2024-03-16T11:10:00Z'),
        classType: 'M1.5',
        sourceLocation: 'N12E45',
        activeRegionNum: 13245
      },
      {
        flareID: 'FLR20240315_002',
        beginTime: new Date('2024-03-15T06:12:00Z'),
        maxTime: new Date('2024-03-15T06:28:00Z'),
        endTime: new Date('2024-03-15T06:55:00Z'),
        classType: 'C8.3',
        sourceLocation: 'S05W12',
        activeRegionNum: 13246
      }
    ];

    return mockFlares;
  } catch (error) {
    console.error('Error fetching solar flare data:', error);
    throw error;
  }
};
