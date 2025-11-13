import { Box, Typography, Paper } from '@mui/material';

export default function TeamDetail() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Team Details
      </Typography>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Team details under construction...
        </Typography>
      </Paper>
    </Box>
  );
}
