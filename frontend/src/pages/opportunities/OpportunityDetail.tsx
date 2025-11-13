import { Box, Typography, Paper } from '@mui/material';

export default function OpportunityDetail() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Opportunity Details
      </Typography>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Opportunity details under construction...
        </Typography>
      </Paper>
    </Box>
  );
}
