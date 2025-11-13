import { Box, Typography, Paper } from '@mui/material';

export default function IndividualDashboard() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Individual Dashboard
      </Typography>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Dashboard under construction...
        </Typography>
      </Paper>
    </Box>
  );
}
