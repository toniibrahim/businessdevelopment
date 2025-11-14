import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Group as GroupIcon,
  Security as SecurityIcon,
  Edit as EditIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { format, parseISO } from 'date-fns';
import api from '../../services/api';
import { useAuthStore } from '../../context/AuthContext';
import type { User } from '../../types';

export default function UserProfile() {
  const { setUser } = useAuthStore();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const [profileFormData, setProfileFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });

  const [passwordFormData, setPasswordFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getCurrentUser();
      setProfile(data);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error?.message || 'Failed to load profile';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditOpen = () => {
    if (!profile) return;
    setProfileFormData({
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email,
      phone: profile.phone || '',
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!profile || !profileFormData.first_name || !profileFormData.last_name || !profileFormData.email) {
      toast.error('First name, last name, and email are required');
      return;
    }

    try {
      const payload: any = {
        first_name: profileFormData.first_name,
        last_name: profileFormData.last_name,
        email: profileFormData.email,
        phone: profileFormData.phone || null,
      };

      const updatedUser = await api.updateUser(profile.id, payload);
      setProfile(updatedUser);
      setUser(updatedUser);
      toast.success('Profile updated successfully');
      setEditDialogOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to update profile');
    }
  };

  const handlePasswordChangeOpen = () => {
    setPasswordFormData({
      current_password: '',
      new_password: '',
      confirm_password: '',
    });
    setPasswordDialogOpen(true);
  };

  const handlePasswordChangeSubmit = async () => {
    if (!passwordFormData.current_password || !passwordFormData.new_password || !passwordFormData.confirm_password) {
      toast.error('All password fields are required');
      return;
    }

    if (passwordFormData.new_password !== passwordFormData.confirm_password) {
      toast.error('New password and confirmation do not match');
      return;
    }

    if (passwordFormData.new_password.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }

    try {
      await api.changePassword(
        passwordFormData.current_password,
        passwordFormData.new_password
      );
      toast.success('Password changed successfully');
      setPasswordDialogOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to change password');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return dateString;
    }
  };

  const getRoleColor = (role: string): 'error' | 'warning' | 'primary' | 'default' => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'manager':
        return 'warning';
      case 'sales':
        return 'primary';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !profile) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          My Profile
        </Typography>
        <Alert severity="error">{error || 'Failed to load profile'}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">My Profile</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEditOpen}
          >
            Edit Profile
          </Button>
          <Button
            variant="outlined"
            startIcon={<SecurityIcon />}
            onClick={handlePasswordChangeOpen}
          >
            Change Password
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <PersonIcon color="primary" />
                <Typography variant="h6">Personal Information</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Full Name
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {profile.first_name} {profile.last_name}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1">{profile.email}</Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Username
                  </Typography>
                  <Typography variant="body1">{profile.username}</Typography>
                </Grid>

                {profile.phone && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Phone
                        </Typography>
                        <Typography variant="body1">{profile.phone}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Account Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <GroupIcon color="primary" />
                <Typography variant="h6">Account Information</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Role
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={profile.role.toUpperCase()}
                      color={getRoleColor(profile.role)}
                      size="small"
                    />
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Team
                  </Typography>
                  <Typography variant="body1">
                    {profile.team ? profile.team.name : 'No team assigned'}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Account Created
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(profile.created_at)}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(profile.updated_at)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Account Stats (if needed) */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary">
                    User ID
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {profile.id}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="First Name *"
              value={profileFormData.first_name}
              onChange={(e) => setProfileFormData({ ...profileFormData, first_name: e.target.value })}
              fullWidth
              autoFocus
            />
            <TextField
              label="Last Name *"
              value={profileFormData.last_name}
              onChange={(e) => setProfileFormData({ ...profileFormData, last_name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email *"
              type="email"
              value={profileFormData.email}
              onChange={(e) => setProfileFormData({ ...profileFormData, email: e.target.value })}
              fullWidth
            />
            <TextField
              label="Phone"
              value={profileFormData.phone}
              onChange={(e) => setProfileFormData({ ...profileFormData, phone: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained" startIcon={<SaveIcon />}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Current Password *"
              type="password"
              value={passwordFormData.current_password}
              onChange={(e) => setPasswordFormData({ ...passwordFormData, current_password: e.target.value })}
              fullWidth
              autoFocus
            />
            <TextField
              label="New Password *"
              type="password"
              value={passwordFormData.new_password}
              onChange={(e) => setPasswordFormData({ ...passwordFormData, new_password: e.target.value })}
              fullWidth
              helperText="Must be at least 8 characters long"
            />
            <TextField
              label="Confirm New Password *"
              type="password"
              value={passwordFormData.confirm_password}
              onChange={(e) => setPasswordFormData({ ...passwordFormData, confirm_password: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button onClick={handlePasswordChangeSubmit} variant="contained" startIcon={<SecurityIcon />}>
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
