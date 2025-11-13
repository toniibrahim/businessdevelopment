import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { useAuthStore } from '../../context/AuthContext';

const validationSchema = yup.object({
  username: yup.string().required('Email or username is required'),
  password: yup.string().required('Password is required'),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        clearError();
        await login(values);
        toast.success('Login successful!');
        navigate('/dashboard');
      } catch (error: any) {
        toast.error(error.response?.data?.error?.message || 'Login failed');
      }
    },
  });

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Sign In
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Enter your credentials to access your account
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      <form onSubmit={formik.handleSubmit}>
        <TextField
          fullWidth
          id="username"
          name="username"
          label="Email or Username"
          placeholder="admin@bdpipeline.com"
          value={formik.values.username}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.username && Boolean(formik.errors.username)}
          helperText={formik.touched.username && formik.errors.username}
          margin="normal"
          autoFocus
        />

        <TextField
          fullWidth
          id="password"
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
          margin="normal"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          <Link
            component={RouterLink}
            to="/forgot-password"
            variant="body2"
            underline="hover"
          >
            Forgot password?
          </Link>
        </Box>

        <Button
          color="primary"
          variant="contained"
          fullWidth
          type="submit"
          size="large"
          disabled={formik.isSubmitting}
          startIcon={<LoginIcon />}
          sx={{ mt: 3, mb: 2 }}
        >
          {formik.isSubmitting ? 'Signing in...' : 'Sign In'}
        </Button>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <Link component={RouterLink} to="/register" underline="hover">
              Sign up
            </Link>
          </Typography>
        </Box>

        <Box sx={{ mt: 3, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary" component="div">
            <strong>Demo Accounts:</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary" component="div">
            Admin: admin@bdpipeline.com / Admin@123456
          </Typography>
          <Typography variant="caption" color="text.secondary" component="div">
            Manager: manager@bdpipeline.com / Manager@123456
          </Typography>
          <Typography variant="caption" color="text.secondary" component="div">
            Sales: sales@bdpipeline.com / Sales@123456
          </Typography>
        </Box>
      </form>
    </Box>
  );
}
