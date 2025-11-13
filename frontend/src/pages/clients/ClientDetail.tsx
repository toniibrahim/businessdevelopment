import { Box, Typography, Paper } from '@mui/material';

export default function ClientDetail() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Client Details
      </Typography>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Client details under construction...
        </Typography>
      </Paper>
    </Box>
  );
}
