import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { format, parseISO } from 'date-fns';
import api from '../../services/api';
import type { ClientCompany } from '../../types';

export default function ClientDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<ClientCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadClient();
  }, [id]);

  const loadClient = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await api.getClientById(id);
      setClient(data);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error?.message || 'Failed to load client';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      setIsDeleting(true);
      await api.deleteClient(id);
      toast.success('Client deleted successfully');
      navigate('/clients');
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || 'Failed to delete client'
      );
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const getTierColor = (tier: string): 'success' | 'primary' | 'warning' | 'error' | 'default' => {
    if (tier.includes('5')) return 'success';
    if (tier.includes('4')) return 'primary';
    if (tier.includes('3')) return 'warning';
    if (tier.includes('2') || tier.includes('1')) return 'error';
    return 'default';
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return dateString;
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

  if (error || !client) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton onClick={() => navigate('/clients')}>
            <BackIcon />
          </IconButton>
          <Typography variant="h4">Client Details</Typography>
        </Box>
        <Alert severity="error">{error || 'Client not found'}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header with actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/clients')}>
          <BackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4">{client.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            Created {formatDate(client.created_at)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate('/clients')}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Company Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <BusinessIcon color="primary" />
                <Typography variant="h6">Company Information</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Company Name
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {client.name}
                  </Typography>
                </Grid>

                {client.industry && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Industry
                    </Typography>
                    <Typography variant="body1">{client.industry}</Typography>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Relationship Tier
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={client.relationship_tier}
                      color={getTierColor(client.relationship_tier)}
                      size="small"
                    />
                  </Box>
                </Grid>

                {client.address && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <LocationIcon color="action" fontSize="small" sx={{ mt: 0.5 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Address
                        </Typography>
                        <Typography variant="body1">{client.address}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Contact Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <PersonIcon color="primary" />
                <Typography variant="h6">Contact Information</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                {client.contact_person && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon color="action" fontSize="small" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Contact Person
                        </Typography>
                        <Typography variant="body1">{client.contact_person}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}

                {client.email && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon color="action" fontSize="small" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="body1">
                          <a href={`mailto:${client.email}`} style={{ color: 'inherit' }}>
                            {client.email}
                          </a>
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}

                {client.phone && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon color="action" fontSize="small" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Phone
                        </Typography>
                        <Typography variant="body1">
                          <a href={`tel:${client.phone}`} style={{ color: 'inherit' }}>
                            {client.phone}
                          </a>
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Additional Information */}
        {client.notes && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Notes
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {client.notes}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Metadata */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Record Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Created At
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(client.created_at)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(client.updated_at)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !isDeleting && setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Client</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{client.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
