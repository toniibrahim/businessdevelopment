import { Outlet, Navigate } from 'react-router-dom';
import { Box, Container, Paper, Typography } from '@mui/material';
import { useAuthStore } from '../../context/AuthContext';

export default function AuthLayout() {
  const { isAuthenticated } = useAuthStore();

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #366092 0%, #5a7eb0 100%)',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{ color: 'white', fontWeight: 700 }}
          >
            BD Pipeline
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
            Business Development Management System
          </Typography>
        </Box>

        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 3,
          }}
        >
          <Outlet />
        </Paper>

        <Typography
          variant="body2"
          sx={{
            color: 'rgba(255,255,255,0.8)',
            textAlign: 'center',
            mt: 3,
          }}
        >
          © 2025 BD Pipeline. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
