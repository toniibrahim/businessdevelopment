import { Box, Typography, Paper } from '@mui/material';

export default function UserList() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Users
      </Typography>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="body1" color="text.secondary">
          User list under construction...
        </Typography>
      </Paper>
    </Box>
  );
}
