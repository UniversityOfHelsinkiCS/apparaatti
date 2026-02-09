import { Box, Typography, Paper } from '@mui/material'

const NoRecommendationsInfo = () => {
  return (
    <Paper
      elevation={2}
      sx={{
        padding: 4,
        margin: 2,
        textAlign: 'center',
        backgroundColor: 'background.paper',
      }}
    >
      <Box>
        <Typography variant="h6" component="h2" gutterBottom>
          Kursseja ei löytynyt
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Yritä muuttaa valintojasi nähdäksesi kursseja.
        </Typography>
      </Box>
    </Paper>
  )
}

export default NoRecommendationsInfo
