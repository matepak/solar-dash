import axios from 'axios';

const DSCOVR_DISTANCE_FROM_EARTH = 1500000 //km

// Set up API endpoints
const KP_INDEX_URL = process.env.REACT_APP_KP_INDEX_URL || 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json';
const KP_FORECAST_URL = process.env.REACT_APP_KP_FORECAST_URL || 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json';
const ALERTS_URL = process.env.REACT_APP_ALERTS_URL || 'https://services.swpc.noaa.gov/products/alerts.json';
const NOAA_MAG_URL = process.env.REACT_APP_NOAA_MAG_URL || 'https://services.swpc.noaa.gov/products/solar-wind/mag-1-day.json';
const NOAA_PLASMA_URL = process.env.REACT_APP_NOAA_PLASMA_URL || 'https://services.swpc.noaa.gov/products/solar-wind/plasma-1-day.json';
// Define data types
export interface KpIndexData {
  timeTag: Date;
  kpValue: number;
  aRunning: number;
  stationCount: number;
  color: string;
}

export interface KpForecastData {
  timeTag: Date;
  kpValue: number;
  observed: 'observed' | 'estimated' | 'predicted';
  noaaScale: string;
}

export interface AlertsData {
  product_id: string;
  issue_datetime: string;
  message: string;
}

export interface MagData {
  timeTag: Date;
  bx_gsm: number;
  by_gsm: number;
  bz_gsm: number;
  lon_gsm: number;
  lat_gsm: number;
  bt: number;
}

export interface PlasmaData {
  timeTag: Date;
  protonDensity: number;
  speed: number;
  temperature: number;
}

// Function to map Kp values to colors
export const mapKpToColor = (kpValue: number): string => {
  kpValue = Math.ceil(kpValue);
  if (kpValue < 5) {
    return 'green';
  } else if (kpValue === 5) {
    return 'yellow';
  } else if (kpValue === 6) {
    return 'orange';
  } else if (kpValue === 7) {
    return 'red';
  } else if (kpValue >= 8 && kpValue <= 9) {
    return 'darkred';
  } else {
    return 'brown';
  }
};

// Function to map NOAA scale based on Kp value
export const mapKpToNoaaScale = (kpValue: number): string => {
  kpValue = Math.ceil(kpValue);
  if (kpValue < 5) {
    return 'G0';
  } else if (kpValue === 5) {
    return 'G1';
  } else if (kpValue === 6) {
    return 'G2';
  } else if (kpValue === 7) {
    return 'G3';
  } else if (kpValue === 8) {
    return 'G4';
  } else {
    return 'G5';
  }
};

// Function to fetch and process Kp index data
export const fetchKpIndexData = async (): Promise<KpIndexData[]> => {
  try {
    const response = await axios.get(KP_INDEX_URL);
    const data = response.data;

    // Skip the header row
    const processedData = data.slice(1).map((row: any) => {
      const kpValue = parseFloat(row[1]);
      return {
        timeTag: new Date(row[0]),
        kpValue: kpValue,
        aRunning: parseFloat(row[2]),
        stationCount: parseInt(row[3]),
        color: mapKpToColor(kpValue)
      };
    });

    return processedData;
  } catch (error) {
    console.error('Error fetching Kp index data:', error);
    throw error;
  }
};

// Function to fetch and process NOAA magnetic field data
export const fetchMagData = async (): Promise<MagData[]> => {
  try {
    const response = await axios.get(NOAA_MAG_URL);
    const data = response.data;

    // Skip the header row
    const processedData = data.slice(1).map((row: any) => {
      return {
        timeTag: new Date(row[0]),
        bx_gsm: parseFloat(row[1]),
        by_gsm: parseFloat(row[2]),
        bz_gsm: parseFloat(row[3]),
        lon_gsm: parseFloat(row[4]),
        lat_gsm: parseFloat(row[5]),
        bt: parseFloat(row[6])
      };
    });

    return processedData;
  } catch (error) {
    console.error('Error fetching NOAA magnetic field data:', error);
    throw error;
  }
};

// Function to fetch and process NOAA plasma data
export const fetchPlasmaData = async (): Promise<PlasmaData[]> => {
  try {
    const response = await axios.get(NOAA_PLASMA_URL);
    const data = response.data;

    // Skip the header row
    const processedData = data.slice(1).map((row: any) => {
      return {
        timeTag: new Date(row[0]),
        protonDensity: parseFloat(row[1]),
        speed: parseFloat(row[2]),
        temperature: parseFloat(row[3]),
      };
    });

    return processedData;
  } catch (error) {
    console.error('Error fetching NOAA plasma data:', error);
    throw error;
  }
};



// Function to fetch and process Kp forecast data
export const fetchKpForecastData = async (): Promise<KpForecastData[]> => {
  try {
    const response = await axios.get(KP_FORECAST_URL);
    const data = response.data;

    // Skip the header row
    const processedData = data.slice(1)
      .filter((row: any) => row[2] === 'estimated' || row[2] === 'predicted')
      .map((row: any) => {
        const kpValue = parseFloat(row[1]);
        return {
          timeTag: new Date(row[0]),
          kpValue: kpValue,
          observed: row[2],
          noaaScale: mapKpToNoaaScale(kpValue)
        };
      });

    return processedData;
  } catch (error) {
    console.error('Error fetching Kp forecast data:', error);
    throw error;
  }
};

// Function to check if there's an active geomagnetic storm
export const checkForGeomagneticStorm = (kpData: KpIndexData[]): boolean => {
  // Check the most recent 4 entries
  const recentEntries = kpData.slice(-4);
  return recentEntries.some(entry => entry.kpValue >= 5);
};

// Function to fetch and process alerts data
export const fetchAlertsData = async (): Promise<AlertsData[]> => {
  try {
    const response = await axios.get<AlertsData[]>(ALERTS_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching alerts data:', error);
    throw error;
  }
};

// Function to calculate solar wind propagation time from DSCOVR to Earth
export const calculateSolarWindPropagationTime = async (): Promise<number> => {
  return await fetchPlasmaData().then(data => {
    const recentData = data.slice(-1)[0];
    // Check if recentData exists and has a valid speed property
    if (!recentData || typeof recentData.speed !== 'number' || isNaN(recentData.speed) || recentData.speed === 0) {
      console.error('Invalid or missing plasma speed data:', recentData);
      return NaN; // or throw new Error('Invalid plasma data') if you prefer
    }
    // Calculate the propagation time in minutes
    const propagationTime = DSCOVR_DISTANCE_FROM_EARTH / recentData.speed / 60;
    return propagationTime;
  });
};

