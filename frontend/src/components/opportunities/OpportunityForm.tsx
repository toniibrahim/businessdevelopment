import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  FormHelperText,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import type { Opportunity } from '../../types';

interface OpportunityFormProps {
  initialValues?: Partial<Opportunity>;
  onSubmit: (values: OpportunityFormValues) => void;
  isSubmitting?: boolean;
}

export interface OpportunityFormValues {
  project_name: string;
  service_type: string;
  sector_type: string;
  original_amount: number;
  project_maturity: string;
  client_type: string;
  client_relationship: string;
  conservative_approach: boolean;
  starting_date?: string;
  closing_date?: string;
  status: string;
  stage: string;
  notes?: string;
}

const validationSchema = yup.object({
  project_name: yup
    .string()
    .required('Project name is required')
    .min(3, 'Project name must be at least 3 characters'),
  service_type: yup.string().required('Service type is required'),
  sector_type: yup.string().required('Sector type is required'),
  original_amount: yup
    .number()
    .required('Amount is required')
    .min(0, 'Amount must be positive'),
  project_maturity: yup.string().required('Project maturity is required'),
  client_type: yup.string().required('Client type is required'),
  client_relationship: yup.string().required('Client relationship is required'),
  conservative_approach: yup.boolean(),
  starting_date: yup.string().nullable(),
  closing_date: yup.string().nullable(),
  status: yup.string().required('Status is required'),
  stage: yup.string().required('Stage is required'),
  notes: yup.string(),
});

export default function OpportunityForm({
  initialValues,
  onSubmit,
  isSubmitting = false,
}: OpportunityFormProps) {
  const formik = useFormik<OpportunityFormValues>({
    initialValues: {
      project_name: initialValues?.project_name || '',
      service_type: initialValues?.service_type || '',
      sector_type: initialValues?.sector_type || '',
      original_amount: initialValues?.original_amount || 0,
      project_maturity: initialValues?.project_maturity || '',
      client_type: initialValues?.client_type || '',
      client_relationship: initialValues?.client_relationship || '',
      conservative_approach: initialValues?.conservative_approach || false,
      starting_date: initialValues?.starting_date || undefined,
      closing_date: initialValues?.closing_date || undefined,
      status: initialValues?.status || 'Active',
      stage: initialValues?.stage || 'Prospection',
      notes: initialValues?.notes || '',
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
    enableReinitialize: true,
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Typography variant="h6" gutterBottom>
        Basic Information
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="project_name"
            name="project_name"
            label="Project Name *"
            value={formik.values.project_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.project_name && Boolean(formik.errors.project_name)}
            helperText={formik.touched.project_name && formik.errors.project_name}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl
            fullWidth
            error={formik.touched.service_type && Boolean(formik.errors.service_type)}
          >
            <InputLabel>Service Type *</InputLabel>
            <Select
              id="service_type"
              name="service_type"
              value={formik.values.service_type}
              label="Service Type *"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <MenuItem value="IFM">IFM (Integrated Facility Management)</MenuItem>
              <MenuItem value="FM">FM (Facility Management)</MenuItem>
              <MenuItem value="Cleaning">Cleaning</MenuItem>
              <MenuItem value="Security">Security</MenuItem>
              <MenuItem value="Catering">Catering</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
            {formik.touched.service_type && formik.errors.service_type && (
              <FormHelperText>{formik.errors.service_type}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl
            fullWidth
            error={formik.touched.sector_type && Boolean(formik.errors.sector_type)}
          >
            <InputLabel>Sector Type *</InputLabel>
            <Select
              id="sector_type"
              name="sector_type"
              value={formik.values.sector_type}
              label="Sector Type *"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <MenuItem value="Data Center">Data Center</MenuItem>
              <MenuItem value="Office">Office</MenuItem>
              <MenuItem value="Industrial">Industrial</MenuItem>
              <MenuItem value="Healthcare">Healthcare</MenuItem>
              <MenuItem value="Retail">Retail</MenuItem>
              <MenuItem value="Education">Education</MenuItem>
              <MenuItem value="Hospitality">Hospitality</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
            {formik.touched.sector_type && formik.errors.sector_type && (
              <FormHelperText>{formik.errors.sector_type}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            id="original_amount"
            name="original_amount"
            label="Original Amount *"
            type="number"
            value={formik.values.original_amount}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.original_amount && Boolean(formik.errors.original_amount)}
            helperText={formik.touched.original_amount && formik.errors.original_amount}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />
      <Typography variant="h6" gutterBottom>
        Probability Factors
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl
            fullWidth
            error={
              formik.touched.project_maturity && Boolean(formik.errors.project_maturity)
            }
          >
            <InputLabel>Project Maturity *</InputLabel>
            <Select
              id="project_maturity"
              name="project_maturity"
              value={formik.values.project_maturity}
              label="Project Maturity *"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <MenuItem value="Prospection">Prospection (15%)</MenuItem>
              <MenuItem value="RFI">RFI (25%)</MenuItem>
              <MenuItem value="RFQ">RFQ (45%)</MenuItem>
              <MenuItem value="Negotiation">Negotiation (75%)</MenuItem>
              <MenuItem value="Contract">Contract (100%)</MenuItem>
            </Select>
            {formik.touched.project_maturity && formik.errors.project_maturity && (
              <FormHelperText>{formik.errors.project_maturity}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl
            fullWidth
            error={formik.touched.client_type && Boolean(formik.errors.client_type)}
          >
            <InputLabel>Client Type *</InputLabel>
            <Select
              id="client_type"
              name="client_type"
              value={formik.values.client_type}
              label="Client Type *"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <MenuItem value="New">New Client (90%)</MenuItem>
              <MenuItem value="Existing">Existing Client (105%)</MenuItem>
            </Select>
            {formik.touched.client_type && formik.errors.client_type && (
              <FormHelperText>{formik.errors.client_type}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl
            fullWidth
            error={
              formik.touched.client_relationship &&
              Boolean(formik.errors.client_relationship)
            }
          >
            <InputLabel>Client Relationship *</InputLabel>
            <Select
              id="client_relationship"
              name="client_relationship"
              value={formik.values.client_relationship}
              label="Client Relationship *"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <MenuItem value="1 - Low">1 - Low (85%)</MenuItem>
              <MenuItem value="2 - Medium">2 - Medium (90%)</MenuItem>
              <MenuItem value="3 - Good">3 - Good (100%)</MenuItem>
              <MenuItem value="4 - High">4 - High (105%)</MenuItem>
              <MenuItem value="5 - Excellent">5 - Excellent (110%)</MenuItem>
            </Select>
            {formik.touched.client_relationship && formik.errors.client_relationship && (
              <FormHelperText>{formik.errors.client_relationship}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Checkbox
                id="conservative_approach"
                name="conservative_approach"
                checked={formik.values.conservative_approach}
                onChange={formik.handleChange}
              />
            }
            label="Conservative Approach (reduces probability by 10%)"
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />
      <Typography variant="h6" gutterBottom>
        Timeline
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <DatePicker
            label="Starting Date"
            value={formik.values.starting_date ? new Date(formik.values.starting_date) : null}
            onChange={(date) => {
              formik.setFieldValue(
                'starting_date',
                date ? format(date, 'yyyy-MM-dd') : undefined
              );
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                error:
                  formik.touched.starting_date && Boolean(formik.errors.starting_date),
                helperText:
                  formik.touched.starting_date && formik.errors.starting_date,
              },
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <DatePicker
            label="Closing Date"
            value={formik.values.closing_date ? new Date(formik.values.closing_date) : null}
            onChange={(date) => {
              formik.setFieldValue(
                'closing_date',
                date ? format(date, 'yyyy-MM-dd') : undefined
              );
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                error: formik.touched.closing_date && Boolean(formik.errors.closing_date),
                helperText: formik.touched.closing_date && formik.errors.closing_date,
              },
            }}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />
      <Typography variant="h6" gutterBottom>
        Status & Stage
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl
            fullWidth
            error={formik.touched.status && Boolean(formik.errors.status)}
          >
            <InputLabel>Status *</InputLabel>
            <Select
              id="status"
              name="status"
              value={formik.values.status}
              label="Status *"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Won">Won</MenuItem>
              <MenuItem value="Lost">Lost</MenuItem>
              <MenuItem value="On Hold">On Hold</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </Select>
            {formik.touched.status && formik.errors.status && (
              <FormHelperText>{formik.errors.status}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl
            fullWidth
            error={formik.touched.stage && Boolean(formik.errors.stage)}
          >
            <InputLabel>Stage *</InputLabel>
            <Select
              id="stage"
              name="stage"
              value={formik.values.stage}
              label="Stage *"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <MenuItem value="Prospection">Prospection</MenuItem>
              <MenuItem value="Qualification">Qualification</MenuItem>
              <MenuItem value="Proposal">Proposal</MenuItem>
              <MenuItem value="Negotiation">Negotiation</MenuItem>
              <MenuItem value="Closed">Closed</MenuItem>
            </Select>
            {formik.touched.stage && formik.errors.stage && (
              <FormHelperText>{formik.errors.stage}</FormHelperText>
            )}
          </FormControl>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />
      <Typography variant="h6" gutterBottom>
        Additional Information
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="notes"
            name="notes"
            label="Notes"
            multiline
            rows={4}
            value={formik.values.notes}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.notes && Boolean(formik.errors.notes)}
            helperText={formik.touched.notes && formik.errors.notes}
          />
        </Grid>
      </Grid>

      {/* Hidden submit button - parent component will trigger submit */}
      <input type="submit" style={{ display: 'none' }} />
    </Box>
  );
}
