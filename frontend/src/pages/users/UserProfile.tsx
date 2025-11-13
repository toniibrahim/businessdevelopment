import { Box, Typography, Paper } from '@mui/material';

export default function UserProfile() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="body1" color="text.secondary">
          User profile under construction...
        </Typography>
      </Paper>
    </Box>
  );
}
