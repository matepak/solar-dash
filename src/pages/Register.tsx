import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
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

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const validatePassword = (password: string): boolean => {
    // Password must be at least 8 characters long
    return password.length >= 8;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    
    if (!validatePassword(password)) {
      setErrorMessage('Password must be at least 8 characters long');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      
      await register(email, password, name);
      navigate('/');
    } catch (error: any) {
      console.error(error);
      
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('Email is already in use. Please use a different email or sign in.');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMessage('Invalid email address');
      } else if (error.code === 'auth/weak-password') {
        setErrorMessage('Password is too weak. Please use a stronger password.');
      } else {
        setErrorMessage('An error occurred during registration. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Create Account
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
            id="name"
            label="Full Name"
            name="name"
            autoComplete="name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            helperText="Password must be at least 8 characters long"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isSubmitting}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Sign Up'}
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link component={RouterLink} to="/login" variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      <Box mt={2} textAlign="center">
        <Typography variant="body2" color="text.secondary">
          By signing up, you agree to our Terms of Service and Privacy Policy.
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

export default Register;
