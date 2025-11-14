import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
} from '@mui/material';
import { ArrowBack as BackIcon, Save as SaveIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';
import OpportunityForm, {
  OpportunityFormValues,
} from '../../components/opportunities/OpportunityForm';

export default function OpportunityCreate() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: OpportunityFormValues) => {
    try {
      setIsSubmitting(true);
      await api.createOpportunity(values as any);
      toast.success('Opportunity created successfully!');
      navigate('/opportunities');
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || 'Failed to create opportunity'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/opportunities')}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4">Create Opportunity</Typography>
      </Box>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <OpportunityForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />

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
              {isSubmitting ? 'Creating...' : 'Create Opportunity'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
