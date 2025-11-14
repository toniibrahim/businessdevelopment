import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Typography,
  Grid,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  GetApp as ExportIcon,
  MoreVert as MoreIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as DuplicateIcon,
  FileDownload as DownloadIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useAuthStore } from '../../context/AuthContext';
import type { Opportunity, OpportunityFilters, OpportunityStatus } from '../../types';

export default function OpportunityList() {
  const navigate = useNavigate();
  const { user: _user } = useAuthStore();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<OpportunityFilters>({
    page: 1,
    limit: 20,
  });

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    loadOpportunities();
  }, [page, pageSize, filters]);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      const response = await api.getOpportunities({
        ...filters,
        page: page + 1,
        limit: pageSize,
      });
      setOpportunities(response.items);
      setTotal(response.total);
    } catch (error: any) {
      toast.error('Failed to load opportunities');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, opportunity: Opportunity) => {
    setAnchorEl(event.currentTarget);
    setSelectedOpportunity(opportunity);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOpportunity(null);
  };

  const handleView = (opportunity: Opportunity) => {
    navigate(`/opportunities/${opportunity.id}`);
    handleMenuClose();
  };

  const handleEdit = (opportunity: Opportunity) => {
    navigate(`/opportunities/${opportunity.id}/edit`);
    handleMenuClose();
  };

  const handleDuplicate = async (opportunity: Opportunity) => {
    try {
      await api.duplicateOpportunity(opportunity.id);
      toast.success('Opportunity duplicated successfully');
      loadOpportunities();
    } catch (error: any) {
      toast.error('Failed to duplicate opportunity');
    }
    handleMenuClose();
  };

  const handleDeleteClick = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedOpportunity) return;

    try {
      await api.deleteOpportunity(selectedOpportunity.id);
      toast.success('Opportunity deleted successfully');
      loadOpportunities();
      setDeleteDialogOpen(false);
      setSelectedOpportunity(null);
    } catch (error: any) {
      toast.error('Failed to delete opportunity');
    }
  };

  const handleExport = async (exportFormat: 'excel' | 'csv' | 'revenue') => {
    try {
      let blob: Blob;
      let filename: string;

      if (exportFormat === 'excel') {
        blob = await api.exportOpportunitiesToExcel(filters);
        filename = `opportunities_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      } else if (exportFormat === 'csv') {
        blob = await api.exportOpportunitiesToCSV(filters);
        filename = `opportunities_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      } else {
        blob = await api.exportRevenueDistribution(filters);
        filename = `revenue_distribution_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      }

      api.downloadFile(blob, filename);
      toast.success('Export successful!');
    } catch (error: any) {
      toast.error('Failed to export data');
    }
    setExportMenuAnchor(null);
  };

  const handleFilterChange = (key: keyof OpportunityFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
    setPage(0);
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: pageSize,
    });
    setPage(0);
  };

  const getStatusColor = (status: OpportunityStatus): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'Won':
        return 'success';
      case 'Active':
        return 'warning';
      case 'Lost':
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'project_name',
      headerName: 'Project Name',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'service_type',
      headerName: 'Service',
      width: 120,
    },
    {
      field: 'sector_type',
      headerName: 'Sector',
      width: 150,
    },
    {
      field: 'original_amount',
      headerName: 'Amount',
      width: 130,
      valueFormatter: (params) => `$${Number(params.value).toLocaleString()}`,
    },
    {
      field: 'probability_score',
      headerName: 'Probability',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={`${(Number(params.value) * 100).toFixed(1)}%`}
          size="small"
          color={Number(params.value) > 0.5 ? 'success' : 'default'}
        />
      ),
    },
    {
      field: 'weighted_amount',
      headerName: 'Weighted',
      width: 130,
      valueFormatter: (params) => `$${Number(params.value).toLocaleString()}`,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          color={getStatusColor(params.value as OpportunityStatus)}
        />
      ),
    },
    {
      field: 'stage',
      headerName: 'Stage',
      width: 130,
    },
    {
      field: 'owner',
      headerName: 'Owner',
      width: 150,
      valueGetter: (params) =>
        params.row.owner ? `${params.row.owner.first_name} ${params.row.owner.last_name}` : '',
    },
    {
      field: 'closing_date',
      headerName: 'Close Date',
      width: 120,
      valueFormatter: (params) =>
        params.value ? format(new Date(params.value), 'MMM dd, yyyy') : '-',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <IconButton
          size="small"
          onClick={(e) => handleMenuOpen(e, params.row as Opportunity)}
        >
          <MoreIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Opportunities</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={(e) => setExportMenuAnchor(e.currentTarget)}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/opportunities/create')}
          >
            Create Opportunity
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: showFilters ? 2 : 0 }}>
            <TextField
              placeholder="Search opportunities..."
              size="small"
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1 }}
            />
            <Button
              variant={showFilters ? 'contained' : 'outlined'}
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
          </Box>

          {showFilters && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status || ''}
                    label="Status"
                    onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Won">Won</MenuItem>
                    <MenuItem value="Lost">Lost</MenuItem>
                    <MenuItem value="On Hold">On Hold</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Stage</InputLabel>
                  <Select
                    value={filters.stage || ''}
                    label="Stage"
                    onChange={(e) => handleFilterChange('stage', e.target.value || undefined)}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Prospection">Prospection</MenuItem>
                    <MenuItem value="Qualification">Qualification</MenuItem>
                    <MenuItem value="Proposal">Proposal</MenuItem>
                    <MenuItem value="Negotiation">Negotiation</MenuItem>
                    <MenuItem value="Closed">Closed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Start Date From"
                  value={filters.date_from ? new Date(filters.date_from) : null}
                  onChange={(date) =>
                    handleFilterChange('date_from', date ? format(date, 'yyyy-MM-dd') : undefined)
                  }
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Close Date To"
                  value={filters.date_to ? new Date(filters.date_to) : null}
                  onChange={(date) =>
                    handleFilterChange('date_to', date ? format(date, 'yyyy-MM-dd') : undefined)
                  }
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>

              <Grid item xs={12}>
                <Button size="small" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      <Card>
        <DataGrid
          rows={opportunities}
          columns={columns}
          rowCount={total}
          loading={loading}
          pageSizeOptions={[10, 20, 50, 100]}
          paginationModel={{ page, pageSize }}
          paginationMode="server"
          onPaginationModelChange={(model) => {
            setPage(model.page);
            setPageSize(model.pageSize);
          }}
          disableRowSelectionOnClick
          autoHeight
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
          }}
        />
      </Card>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => selectedOpportunity && handleView(selectedOpportunity)}>
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => selectedOpportunity && handleEdit(selectedOpportunity)}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => selectedOpportunity && handleDuplicate(selectedOpportunity)}>
          <DuplicateIcon fontSize="small" sx={{ mr: 1 }} />
          Duplicate
        </MenuItem>
        <MenuItem
          onClick={() => selectedOpportunity && handleDeleteClick(selectedOpportunity)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={() => setExportMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleExport('excel')}>
          <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
          Export to Excel
        </MenuItem>
        <MenuItem onClick={() => handleExport('csv')}>
          <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
          Export to CSV
        </MenuItem>
        <MenuItem onClick={() => handleExport('revenue')}>
          <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
          Export Revenue Distribution
        </MenuItem>
      </Menu>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Opportunity</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the opportunity "
            {selectedOpportunity?.project_name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
