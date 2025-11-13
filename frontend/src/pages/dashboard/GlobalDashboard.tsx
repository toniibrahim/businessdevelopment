import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  TrendingUp,
  AttachMoney,
  Assessment,
  CheckCircle,
  Group,
  Groups,
  Business,
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { toast } from 'react-toastify';
import api from '../../services/api';
import type { GlobalDashboard as GlobalDashboardType } from '../../types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function GlobalDashboard() {
  const [dashboard, setDashboard] = useState<GlobalDashboardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getGlobalDashboard();
      setDashboard(data);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error?.message || 'Failed to load global dashboard';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
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

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
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

  if (error || !dashboard) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Global Dashboard
        </Typography>
        <Alert severity="error">{error || 'Failed to load global dashboard'}</Alert>
      </Box>
    );
  }

  const {
    metrics,
    teams_performance,
    opportunities_by_stage,
    opportunities_by_status,
    monthly_forecast,
  } = dashboard;

  // Prepare chart data
  const stageData = opportunities_by_stage.map((item) => ({
    name: item.stage || 'Unknown',
    count: item.count,
    value: item.total_value,
  }));

  const statusData = opportunities_by_status.map((item) => ({
    name: item.status || 'Unknown',
    count: item.count,
    value: item.total_value,
  }));

  const forecastData = monthly_forecast
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    })
    .map((item) => ({
      period: `${item.year}-${String(item.month).padStart(2, '0')}`,
      sales: item.sales_amount,
      margin: item.gross_margin_amount,
    }));

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Global Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Company-wide performance overview and analytics
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Business color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Organization
                </Typography>
              </Box>
              <Typography variant="h4">{metrics.total_teams}</Typography>
              <Typography variant="caption" color="success.main">
                Teams • {metrics.total_users} Users
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Assessment color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Total Opportunities
                </Typography>
              </Box>
              <Typography variant="h4">{metrics.total_opportunities}</Typography>
              <Typography variant="caption" color="success.main">
                {metrics.active_opportunities} Active
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Total Pipeline
                </Typography>
              </Box>
              <Typography variant="h4">{formatCurrency(metrics.pipeline_value)}</Typography>
              <Typography variant="caption" color="text.secondary">
                Weighted: {formatCurrency(metrics.weighted_pipeline_value)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Won Deals
                </Typography>
              </Box>
              <Typography variant="h4">{metrics.won_opportunities}</Typography>
              <Typography variant="caption" color="success.main">
                {formatCurrency(metrics.won_value)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Teams Performance */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Groups color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Teams Performance</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Team</TableCell>
                      <TableCell align="right">Members</TableCell>
                      <TableCell align="right">Opportunities</TableCell>
                      <TableCell align="right">Pipeline Value</TableCell>
                      <TableCell align="right">Won Deals</TableCell>
                      <TableCell align="right">Won Value</TableCell>
                      <TableCell align="right">Win Rate</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {teams_performance.map((team) => {
                      const winRate =
                        team.opportunities_count > 0
                          ? team.won_count / team.opportunities_count
                          : 0;
                      return (
                        <TableRow key={team.team_id}>
                          <TableCell>{team.team_name}</TableCell>
                          <TableCell align="right">{team.members_count}</TableCell>
                          <TableCell align="right">{team.opportunities_count}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(team.pipeline_value)}
                          </TableCell>
                          <TableCell align="right">{team.won_count}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(team.won_value)}
                          </TableCell>
                          <TableCell align="right">{formatPercentage(winRate)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Opportunities by Stage */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Opportunities by Stage
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {stageData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stageData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, count }) => `${name}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {stageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" align="center">
                  No data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Opportunities by Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Opportunities by Status
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" align="center">
                  No data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Forecast */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Company Revenue Forecast (Next 12 Months)
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {forecastData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#1976d2"
                      name="Sales Amount"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="margin"
                      stroke="#2e7d32"
                      name="Gross Margin"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" align="center">
                  No forecast data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Company Performance Summary */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Company Performance Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
                    <Typography variant="caption">Won Opportunities</Typography>
                    <Typography variant="h5">{metrics.won_opportunities}</Typography>
                    <Typography variant="caption">{formatCurrency(metrics.won_value)}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
                    <Typography variant="caption">Lost Opportunities</Typography>
                    <Typography variant="h5">{metrics.lost_opportunities}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                    <Typography variant="caption">Active Opportunities</Typography>
                    <Typography variant="h5">{metrics.active_opportunities}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                    <Typography variant="caption">Company Win Rate</Typography>
                    <Typography variant="h5">{formatPercentage(metrics.win_rate)}</Typography>
                    <Typography variant="caption">
                      Avg: {formatCurrency(metrics.average_deal_size)}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
