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
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { toast } from 'react-toastify';
import api from '../../services/api';
import type { ClientCompany } from '../../types';

export default function ClientList() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientCompany[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedClient, setSelectedClient] = useState<ClientCompany | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    relationship_tier: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });

  useEffect(() => {
    loadClients();
  }, [page, pageSize, search]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await api.getClients({
        page: page + 1,
        limit: pageSize,
        search: search || undefined,
      });
      setClients(response.items);
      setTotal(response.total);
    } catch (error: any) {
      toast.error('Failed to load clients');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, client: ClientCompany) => {
    setAnchorEl(event.currentTarget);
    setSelectedClient(client);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedClient(null);
  };

  const handleView = (client: ClientCompany) => {
    navigate(`/clients/${client.id}`);
    handleMenuClose();
  };

  const handleEditClick = (client: ClientCompany) => {
    setSelectedClient(client);
    setFormData({
      name: client.name,
      industry: client.industry || '',
      relationship_tier: client.relationship_tier,
      contact_person: client.contact_person || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      notes: client.notes || '',
    });
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteClick = (client: ClientCompany) => {
    setSelectedClient(client);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedClient) return;

    try {
      await api.deleteClient(selectedClient.id);
      toast.success('Client deleted successfully');
      loadClients();
      setDeleteDialogOpen(false);
      setSelectedClient(null);
    } catch (error: any) {
      toast.error('Failed to delete client');
    }
  };

  const handleCreateOpen = () => {
    setFormData({
      name: '',
      industry: '',
      relationship_tier: '3 - Good',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
    });
    setCreateDialogOpen(true);
  };

  const handleCreateSubmit = async () => {
    if (!formData.name || !formData.relationship_tier) {
      toast.error('Name and relationship tier are required');
      return;
    }

    try {
      await api.createClient(formData);
      toast.success('Client created successfully');
      setCreateDialogOpen(false);
      loadClients();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to create client');
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedClient || !formData.name || !formData.relationship_tier) {
      toast.error('Name and relationship tier are required');
      return;
    }

    try {
      await api.updateClient(selectedClient.id, formData);
      toast.success('Client updated successfully');
      setEditDialogOpen(false);
      setSelectedClient(null);
      loadClients();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to update client');
    }
  };

  const getTierColor = (tier: string): 'success' | 'primary' | 'warning' | 'error' | 'default' => {
    if (tier.includes('5')) return 'success';
    if (tier.includes('4')) return 'primary';
    if (tier.includes('3')) return 'warning';
    if (tier.includes('2') || tier.includes('1')) return 'error';
    return 'default';
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Company Name',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'industry',
      headerName: 'Industry',
      width: 150,
    },
    {
      field: 'relationship_tier',
      headerName: 'Relationship',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          color={getTierColor(params.value as string)}
        />
      ),
    },
    {
      field: 'contact_person',
      headerName: 'Contact Person',
      width: 180,
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 200,
    },
    {
      field: 'phone',
      headerName: 'Phone',
      width: 150,
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
          onClick={(e) => handleMenuOpen(e, params.row as ClientCompany)}
        >
          <MoreIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Clients</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateOpen}
        >
          Add Client
        </Button>
      </Box>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <TextField
            placeholder="Search clients..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: '100%', maxWidth: 400 }}
          />
        </CardContent>
      </Card>

      <Card>
        <DataGrid
          rows={clients}
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

      {/* Actions Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => selectedClient && handleView(selectedClient)}>
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => selectedClient && handleEditClick(selectedClient)}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => selectedClient && handleDeleteClick(selectedClient)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Client</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Company Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Industry"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              fullWidth
            />
            <TextField
              label="Relationship Tier *"
              select
              value={formData.relationship_tier}
              onChange={(e) => setFormData({ ...formData, relationship_tier: e.target.value })}
              fullWidth
            >
              <MenuItem value="1 - Low">1 - Low</MenuItem>
              <MenuItem value="2 - Medium">2 - Medium</MenuItem>
              <MenuItem value="3 - Good">3 - Good</MenuItem>
              <MenuItem value="4 - High">4 - High</MenuItem>
              <MenuItem value="5 - Excellent">5 - Excellent</MenuItem>
            </TextField>
            <TextField
              label="Contact Person"
              value={formData.contact_person}
              onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
            />
            <TextField
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              fullWidth
            />
            <TextField
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateSubmit} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Client</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Company Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Industry"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              fullWidth
            />
            <TextField
              label="Relationship Tier *"
              select
              value={formData.relationship_tier}
              onChange={(e) => setFormData({ ...formData, relationship_tier: e.target.value })}
              fullWidth
            >
              <MenuItem value="1 - Low">1 - Low</MenuItem>
              <MenuItem value="2 - Medium">2 - Medium</MenuItem>
              <MenuItem value="3 - Good">3 - Good</MenuItem>
              <MenuItem value="4 - High">4 - High</MenuItem>
              <MenuItem value="5 - Excellent">5 - Excellent</MenuItem>
            </TextField>
            <TextField
              label="Contact Person"
              value={formData.contact_person}
              onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
            />
            <TextField
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              fullWidth
            />
            <TextField
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Client</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{selectedClient?.name}"? This action cannot be undone.
          </DialogContentText>
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
