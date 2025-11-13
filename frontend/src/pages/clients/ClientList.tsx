import { Box, Typography, Paper } from '@mui/material';

export default function ClientList() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Clients
      </Typography>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Client list under construction...
        </Typography>
      </Paper>
    </Box>
  );
}
