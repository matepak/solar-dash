import React, { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import {
  AppBar,
  Box,
  Container,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  useMediaQuery,
  useTheme as useMuiTheme,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Image as ImageIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useAlerts } from '../context/AlertsContext';
import { useKpIndexData } from '../hooks/useKpIndexData';
import { playNotificationSound } from '../utils/notificationSound';

const Layout: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { mode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { alertSettings } = useAlerts();
  const { currentKpValue } = useKpIndexData();
  const navigate = useNavigate();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  // In-app push notification state
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const hasNotifiedRef = useRef(false);
  const previousKpRef = useRef<number | null>(null);

  // Watch Kp value and show a toast when it crosses the user's threshold
  useEffect(() => {
    if (
      !user ||
      !alertSettings.pushNotifications ||
      currentKpValue === null
    ) {
      return;
    }

    const threshold = alertSettings.kpThreshold;
    const previousKp = previousKpRef.current;
    previousKpRef.current = currentKpValue;

    // If Kp dropped below threshold, reset so we can notify again next time
    if (currentKpValue < threshold) {
      hasNotifiedRef.current = false;
      return;
    }

    // Kp is at or above threshold — notify once
    if (!hasNotifiedRef.current) {
      // Only show if this is a new crossing (previousKp was below or first load)
      if (previousKp === null || previousKp < threshold) {
        setNotificationMessage(
          `⚡ Geomagnetic storm alert! Kp index is ${currentKpValue} (your threshold: ${threshold}). Aurora may be visible!`
        );
        setNotificationOpen(true);
        playNotificationSound();
      }
      hasNotifiedRef.current = true;
    }
  }, [currentKpValue, user, alertSettings.pushNotifications, alertSettings.kpThreshold]);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      if (isMobile) {
        setDrawerOpen(false);
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const drawerWidth = 240;

  const drawerItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Alerts', icon: <NotificationsIcon />, path: '/alerts' },
    { text: 'Solar Images', icon: <ImageIcon />, path: '/images' },
    { text: 'Aurora Gallery', icon: <ImageIcon />, path: '/gallery' },
  ];

  const drawer = (
    <Box>
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: [1]
        }}
      >
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>
          Solar Dashboard
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {drawerItems.map((item) => (
          <ListItem disablePadding key={item.path}>
            <ListItemButton onClick={() => handleNavigation(item.path)}>
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {user ? (
          <>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigation('/profile')}>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Profile" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigation('/settings')}>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Settings" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigation('/login')}>
              <ListItemIcon>
                <LoginIcon />
              </ListItemIcon>
              <ListItemText primary="Login" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={mode === 'dark'}
              onChange={toggleTheme}
              icon={<LightModeIcon />}
              checkedIcon={<DarkModeIcon />}
            />
          }
          label={mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
        />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: mode === 'dark' ? 'primary.dark' : 'primary.main'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Solar Activity Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? drawerOpen : true}
        onClose={handleDrawerToggle}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8
        }}
      >
        <Container maxWidth="lg">
          <Outlet />
        </Container>
      </Box>
      {/* In-app push notification toast */}
      <Snackbar
        open={notificationOpen}
        autoHideDuration={12000}
        onClose={() => setNotificationOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: 7 }}
      >
        <Alert
          onClose={() => setNotificationOpen(false)}
          severity="warning"
          variant="filled"
          sx={{ width: '100%', fontSize: '0.95rem' }}
        >
          {notificationMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Layout;
