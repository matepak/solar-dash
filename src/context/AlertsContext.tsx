import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useAuth, app } from './AuthContext';

interface AlertSettings {
  kpThreshold: number;
  emailAlerts: boolean;
  pushNotifications: boolean;
  alertFrequency: 'immediately' | 'daily' | 'weekly';
  locations: string[];
}

interface AlertsContextType {
  alertSettings: AlertSettings;
  updateAlertSettings: (settings: Partial<AlertSettings>) => Promise<void>;
  loading: boolean;
  isUpdating: boolean;
  error: string | null;
}

const defaultAlertSettings: AlertSettings = {
  kpThreshold: 5,
  emailAlerts: false,
  pushNotifications: false,
  alertFrequency: 'immediately',
  locations: []
};

const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

interface AlertsProviderProps {
  children: ReactNode;
}

export const AlertsProvider: React.FC<AlertsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [alertSettings, setAlertSettings] = useState<AlertSettings>(defaultAlertSettings);
  const [loading, setLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const db = getFirestore(app);

  // Check if the current user is the demo user
  const isDemoUser = user?.uid === 'demo-user-id';

  // Load user's alert settings from Firestore or localStorage for demo user
  useEffect(() => {
    const fetchAlertSettings = async () => {
      if (!user) {
        setAlertSettings(defaultAlertSettings);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        if (isDemoUser) {
          // For demo user, get settings from localStorage
          const savedSettings = localStorage.getItem('demoUserAlertSettings');
          if (savedSettings) {
            setAlertSettings(JSON.parse(savedSettings));
          } else {
            // Initialize demo user settings in localStorage
            localStorage.setItem('demoUserAlertSettings', JSON.stringify(defaultAlertSettings));
            setAlertSettings(defaultAlertSettings);
          }
        } else {
          // For regular users, get settings from Firestore
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists() && userDoc.data().alertSettings) {
            setAlertSettings(userDoc.data().alertSettings as AlertSettings);
          } else {
            // If user doesn't have alert settings yet, create default ones
            await setDoc(userDocRef, { alertSettings: defaultAlertSettings }, { merge: true });
            setAlertSettings(defaultAlertSettings);
          }
        }
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching alert settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlertSettings();
  }, [user, db, isDemoUser]);

  // Update user's alert settings
  const updateAlertSettings = async (settings: Partial<AlertSettings>) => {
    if (!user) {
      console.error('Save failed: No user logged in');
      throw new Error('User must be logged in to update alert settings');
    }

    try {
      setIsUpdating(true);
      setError(null);
      console.log('Attempting to save alert settings:', settings);

      const newSettings = { ...alertSettings, ...settings };

      if (isDemoUser) {
        console.log('Demo user: Saving to localStorage...');
        localStorage.setItem('demoUserAlertSettings', JSON.stringify(newSettings));
        console.log('localStorage save complete');
      } else {
        console.log('Real user: Saving to Firestore for UID:', user.uid);
        if (!app.options.apiKey || app.options.apiKey === 'your-api-key') {
          throw new Error('Firebase is not configured. Please check your .env file.');
        }
        
        try {
          const userDocRef = doc(db, 'users', user.uid);
          // Include email so the backend service knows where to send alerts
          await setDoc(userDocRef, { 
            alertSettings: newSettings,
            email: user.email 
          }, { merge: true });
          console.log('Firestore save successful');
        } catch (dbError: any) {
          if (dbError.message?.includes('failed-precondition') || dbError.code === 'unavailable') {
            throw new Error('Connection to Firestore failed. If you have an ad-blocker enabled, please disable it for this site.');
          }
          throw dbError;
        }
      }

      setAlertSettings(newSettings);
    } catch (err: any) {
      console.error('Error updating alert settings:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const value = {
    alertSettings,
    updateAlertSettings,
    loading,
    isUpdating,
    error
  };

  return (
    <AlertsContext.Provider value={value}>
      {children}
    </AlertsContext.Provider>
  );
};

export const useAlerts = (): AlertsContextType => {
  const context = useContext(AlertsContext);
  if (context === undefined) {
    throw new Error('useAlerts must be used within an AlertsProvider');
  }
  return context;
};
