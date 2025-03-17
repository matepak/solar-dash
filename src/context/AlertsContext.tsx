import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';

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
  const [error, setError] = useState<string | null>(null);
  
  const db = getFirestore();
  
  // Load user's alert settings from Firestore
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
        
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists() && userDoc.data().alertSettings) {
          setAlertSettings(userDoc.data().alertSettings as AlertSettings);
        } else {
          // If user doesn't have alert settings yet, create default ones
          await setDoc(userDocRef, { alertSettings: defaultAlertSettings }, { merge: true });
          setAlertSettings(defaultAlertSettings);
        }
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching alert settings:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAlertSettings();
  }, [user, db]);
  
  // Update user's alert settings
  const updateAlertSettings = async (settings: Partial<AlertSettings>) => {
    if (!user) {
      throw new Error('User must be logged in to update alert settings');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const newSettings = { ...alertSettings, ...settings };
      const userDocRef = doc(db, 'users', user.uid);
      
      await updateDoc(userDocRef, { alertSettings: newSettings });
      
      setAlertSettings(newSettings);
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating alert settings:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const value = {
    alertSettings,
    updateAlertSettings,
    loading,
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
