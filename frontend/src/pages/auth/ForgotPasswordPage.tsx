import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, TextField, Typography, Link, Alert } from '@mui/material';
import { Email as EmailIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import api from '../../services/api';

const validationSchema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
});

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await api.forgotPassword(values);
        setSubmitted(true);
        toast.success('Password reset instructions sent to your email');
      } catch (error: any) {
        toast.error(
          error.response?.data?.error?.message || 'Failed to send reset instructions'
        );
      }
    },
  });

  if (submitted) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Check Your Email
        </Typography>

        <Alert severity="success" sx={{ my: 3 }}>
          We've sent password reset instructions to <strong>{formik.values.email}</strong>
        </Alert>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Please check your email and click the reset link to create a new password. The
          link will expire in 1 hour.
        </Typography>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Link component={RouterLink} to="/login" underline="hover">
            <Button startIcon={<BackIcon />}>Back to Sign In</Button>
          </Link>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Forgot Password?
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Enter your email address and we'll send you instructions to reset your password
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        <TextField
          fullWidth
          id="email"
          name="email"
          label="Email Address"
          type="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
          margin="normal"
          autoFocus
        />

        <Button
          color="primary"
          variant="contained"
          fullWidth
          type="submit"
          size="large"
          disabled={formik.isSubmitting}
          startIcon={<EmailIcon />}
          sx={{ mt: 3, mb: 2 }}
        >
          {formik.isSubmitting ? 'Sending...' : 'Send Reset Instructions'}
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
