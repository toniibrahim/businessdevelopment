import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ArrowBack as BackIcon, Save as SaveIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';
import OpportunityForm, {
  OpportunityFormValues,
} from '../../components/opportunities/OpportunityForm';
import type { Opportunity } from '../../types';

export default function OpportunityEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadOpportunity();
  }, [id]);

  const loadOpportunity = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await api.getOpportunityById(id);
      setOpportunity(data);
    } catch (error: any) {
      setError(error.response?.data?.error?.message || 'Failed to load opportunity');
      toast.error('Failed to load opportunity');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: OpportunityFormValues) => {
    if (!id) return;

    try {
      setIsSubmitting(true);
      await api.updateOpportunity(id, values as any);
      toast.success('Opportunity updated successfully!');
      navigate('/opportunities');
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || 'Failed to update opportunity'
      );
    } finally {
      setIsSubmitting(false);
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

  if (error || !opportunity) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton onClick={() => navigate('/opportunities')}>
            <BackIcon />
          </IconButton>
          <Typography variant="h4">Edit Opportunity</Typography>
        </Box>
        <Alert severity="error">{error || 'Opportunity not found'}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/opportunities')}>
          <BackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4">Edit Opportunity</Typography>
          <Typography variant="body2" color="text.secondary">
            {opportunity.project_name}
          </Typography>
        </Box>
      </Box>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <OpportunityForm
            initialValues={opportunity}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/opportunities')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={() => {
                // Trigger form submit
                document.querySelector<HTMLFormElement>('form')?.requestSubmit();
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
