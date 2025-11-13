import { Box, Typography, Paper } from '@mui/material';

export default function OpportunityList() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Opportunities
      </Typography>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Opportunity list under construction...
        </Typography>
      </Paper>
    </Box>
  );
}
