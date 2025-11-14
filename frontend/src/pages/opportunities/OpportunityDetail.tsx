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
  Grid,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Stack,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ChangeCircle as StatusIcon,
  TrendingUp as TrendingIcon,
  Person as PersonIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { format, parseISO } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../../services/api';
import type { Opportunity, Activity, RevenueDistribution } from '../../types';

export default function OpportunityDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [revenueDistribution, setRevenueDistribution] = useState<RevenueDistribution[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      // Load all data in parallel
      const [opportunityData, activitiesData, revenueData] = await Promise.all([
        api.getOpportunityById(id),
        api.getOpportunityActivities(id),
        api.getOpportunityRevenueDistribution(id),
      ]);

      setOpportunity(opportunityData);
      setActivities(activitiesData.items || []);
      setRevenueDistribution(revenueData.items || []);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error?.message || 'Failed to load opportunity';
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
      await api.deleteOpportunity(id);
      toast.success('Opportunity deleted successfully!');
      navigate('/opportunities');
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || 'Failed to delete opportunity'
      );
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!id || !newStatus) return;

    try {
      setIsUpdatingStatus(true);
      const updated = await api.updateOpportunityStatus(id, newStatus, statusNotes);
      setOpportunity(updated);
      toast.success('Status updated successfully!');
      setStatusDialogOpen(false);
      setStatusNotes('');
      // Reload activities to show the status change
      loadData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || 'Failed to update status'
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'primary';
      case 'Won':
        return 'success';
      case 'Lost':
        return 'error';
      case 'On Hold':
        return 'warning';
      case 'Cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Prospection':
        return 'info';
      case 'Qualification':
        return 'primary';
      case 'Proposal':
        return 'warning';
      case 'Negotiation':
        return 'secondary';
      case 'Closed':
        return 'success';
      default:
        return 'default';
    }
  };


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return dateString;
    }
  };

  // Prepare chart data
  const chartData = revenueDistribution
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    })
    .map((item) => ({
      period: `${item.year}-${String(item.month).padStart(2, '0')}`,
      sales: item.sales_amount,
      margin: item.gross_margin_amount,
    }));

  const totalSales = revenueDistribution.reduce(
    (sum, item) => sum + item.sales_amount,
    0
  );
  const totalMargin = revenueDistribution.reduce(
    (sum, item) => sum + item.gross_margin_amount,
    0
  );

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
          <Typography variant="h4">Opportunity Details</Typography>
        </Box>
        <Alert severity="error">{error || 'Opportunity not found'}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header with actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/opportunities')}>
          <BackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4">{opportunity.project_name}</Typography>
          <Typography variant="body2" color="text.secondary">
            Created {formatDateTime(opportunity.created_at)} by {opportunity.owner.first_name}{' '}
            {opportunity.owner.last_name}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<StatusIcon />}
            onClick={() => {
              setNewStatus(opportunity.status);
              setStatusDialogOpen(true);
            }}
          >
            Update Status
          </Button>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/opportunities/${id}/edit`)}
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
        {/* Basic Information */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Opportunity Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={opportunity.status}
                      color={getStatusColor(opportunity.status)}
                      size="small"
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Stage
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={opportunity.stage}
                      color={getStageColor(opportunity.stage)}
                      size="small"
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Service Type
                  </Typography>
                  <Typography variant="body1">{opportunity.service_type}</Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Sector Type
                  </Typography>
                  <Typography variant="body1">{opportunity.sector_type}</Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Original Amount
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" color="primary">
                    {formatCurrency(opportunity.original_amount)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Weighted Amount
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" color="success.main">
                    {formatCurrency(opportunity.weighted_amount)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Probability Score
                  </Typography>
                  <Typography variant="body1">
                    {(opportunity.probability_score * 100).toFixed(1)}%
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Owner
                  </Typography>
                  <Typography variant="body1">
                    {opportunity.owner.first_name} {opportunity.owner.last_name}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Starting Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(opportunity.starting_date)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Closing Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(opportunity.closing_date)}
                  </Typography>
                </Grid>

                {opportunity.notes && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Notes
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {opportunity.notes}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Probability Factors */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Probability Factors
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Project Maturity
                  </Typography>
                  <Typography variant="body1">{opportunity.project_maturity}</Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Client Type
                  </Typography>
                  <Typography variant="body1">{opportunity.client_type}</Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Client Relationship
                  </Typography>
                  <Typography variant="body1">
                    {opportunity.client_relationship}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Conservative Approach
                  </Typography>
                  <Typography variant="body1">
                    {opportunity.conservative_approach ? 'Yes' : 'No'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Revenue Distribution Chart */}
          {chartData.length > 0 && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <TrendingIcon color="primary" />
                  <Typography variant="h6">Revenue Distribution</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Total Sales
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {formatCurrency(totalSales)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Total Gross Margin
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {formatCurrency(totalMargin)}
                    </Typography>
                  </Grid>
                </Grid>

                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                    <Bar dataKey="sales" fill="#1976d2" name="Sales Amount" />
                    <Bar
                      dataKey="margin"
                      fill="#2e7d32"
                      name="Gross Margin"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Activity Timeline */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TimelineIcon color="primary" />
                <Typography variant="h6">Activity Timeline</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {activities.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No activities yet
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {activities.map((activity) => (
                    <Paper key={activity.id} elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderLeft: 3, borderColor: 'primary.main' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {activity.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(parseISO(activity.created_at), 'MMM dd, HH:mm')}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          mt: 0.5,
                        }}
                      >
                        <PersonIcon sx={{ fontSize: 14 }} color="action" />
                        <Typography variant="caption" color="text.secondary">
                          {activity.user.first_name} {activity.user.last_name}
                        </Typography>
                      </Box>
                      {activity.old_value && activity.new_value && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', mt: 0.5 }}
                        >
                          {activity.old_value} → {activity.new_value}
                        </Typography>
                      )}
                    </Paper>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !isDeleting && setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Opportunity</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{opportunity.project_name}"? This action
            cannot be undone.
          </Typography>
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

      {/* Status Update Dialog */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => !isUpdatingStatus && setStatusDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={newStatus}
              label="Status"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Won">Won</MenuItem>
              <MenuItem value="Lost">Lost</MenuItem>
              <MenuItem value="On Hold">On Hold</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Notes (optional)"
            multiline
            rows={3}
            value={statusNotes}
            onChange={(e) => setStatusNotes(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setStatusDialogOpen(false)}
            disabled={isUpdatingStatus}
          >
            Cancel
          </Button>
          <Button
            onClick={handleStatusUpdate}
            variant="contained"
            disabled={isUpdatingStatus || !newStatus}
          >
            {isUpdatingStatus ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
