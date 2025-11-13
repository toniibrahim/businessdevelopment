import { Box, Typography, Paper } from '@mui/material';

export default function GlobalDashboard() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Global Dashboard
      </Typography>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Global dashboard under construction...
        </Typography>
      </Paper>
    </Box>
  );
}
