import { Box, Typography, Paper } from '@mui/material';

export default function TeamDashboard() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Team Dashboard
      </Typography>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Team dashboard under construction...
        </Typography>
      </Paper>
    </Box>
  );
}
