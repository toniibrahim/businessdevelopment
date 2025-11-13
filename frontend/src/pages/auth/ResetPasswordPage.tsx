import { useState } from 'react';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
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
import {
  Visibility,
  VisibilityOff,
  LockReset as ResetIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import api from '../../services/api';

const validationSchema = yup.object({
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Password must contain uppercase, lowercase, number, and special character'
    )
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!token) {
        toast.error('Invalid reset token');
        return;
      }

      try {
        await api.resetPassword({
          token,
          new_password: values.password,
        });
        toast.success('Password reset successful!');
        navigate('/login');
      } catch (error: any) {
        toast.error(
          error.response?.data?.error?.message || 'Failed to reset password'
        );
      }
    },
  });

  if (!token) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Invalid Reset Link
        </Typography>

        <Alert severity="error" sx={{ my: 3 }}>
          This password reset link is invalid or has expired.
        </Alert>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Please request a new password reset link.
        </Typography>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Link component={RouterLink} to="/forgot-password" underline="hover">
            <Button variant="contained">Request New Link</Button>
          </Link>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Reset Password
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Enter your new password below
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        <TextField
          fullWidth
          id="password"
          name="password"
          label="New Password"
          type={showPassword ? 'text' : 'password'}
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
          margin="normal"
          autoFocus
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

        <TextField
          fullWidth
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm New Password"
          type={showConfirmPassword ? 'text' : 'password'}
          value={formik.values.confirmPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={
            formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)
          }
          helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
          margin="normal"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          color="primary"
          variant="contained"
          fullWidth
          type="submit"
          size="large"
          disabled={formik.isSubmitting}
          startIcon={<ResetIcon />}
          sx={{ mt: 3, mb: 2 }}
        >
          {formik.isSubmitting ? 'Resetting...' : 'Reset Password'}
        </Button>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Link component={RouterLink} to="/login" underline="hover">
            <Button startIcon={<BackIcon />} size="small">
              Back to Sign In
            </Button>
          </Link>
        </Box>
      </form>
    </Box>
  );
}
