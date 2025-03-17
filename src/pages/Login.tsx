import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Grid,
  Link,
  Paper,
  TextField,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, loginAsDemo, isDevelopment } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMessage('Please enter both email and password');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      await login(email, password);
      navigate('/');
    } catch (error: any) {
      console.error(error);

      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setErrorMessage('Invalid email or password');
      } else if (error.code === 'auth/too-many-requests') {
        setErrorMessage('Too many unsuccessful login attempts. Please try again later.');
      } else {
        setErrorMessage('An error occurred during login. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>

        {errorMessage && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {errorMessage}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
          />
          <FormControlLabel
            control={
              <Checkbox
                value="remember"
                color="primary"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isSubmitting}
              />
            }
            label="Remember me"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>
          <Grid container>
            <Grid item xs>
              <Link component={RouterLink} to="/forgot-password" variant="body2">
                Forgot password?
              </Link>
            </Grid>
            {!isDevelopment && (
              <Grid item>
                <Link component={RouterLink} to="/register" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            )}
          </Grid>
        </Box>
      </Paper>

      <Box mt={2} textAlign="center">
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Try out the dashboard with our demo account to explore all features.
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          sx={{ mt: 1, mb: 2 }}
          onClick={async () => {
            try {
              setIsSubmitting(true);
              setErrorMessage(null);
              await loginAsDemo();
              navigate('/');
            } catch (error: any) {
              console.error(error);
              setErrorMessage('Failed to login as demo user. Please try again.');
            } finally {
              setIsSubmitting(false);
            }
          }}
          disabled={isSubmitting}
        >
          Try Demo Account
        </Button>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Or continue without an account to view public data.
        </Typography>
        <Button
          variant="outlined"
          sx={{ mt: 1 }}
          onClick={() => navigate('/')}
          disabled={isSubmitting}
        >
          Continue as Guest
        </Button>
      </Box>
    </Container>
  );
};

export default Login;
