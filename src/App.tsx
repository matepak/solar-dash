import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { useTheme } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import SolarImages from './pages/SolarImages';
import NotFound from './pages/NotFound';

// Layout
import Layout from './components/Layout';

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

function App() {
  const { theme } = useTheme();
  
  return (
    <MuiThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="images" element={<SolarImages />} />
            <Route 
              path="profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </LocalizationProvider>
    </MuiThemeProvider>
  );
}

export default App;
