import { Box, Typography, Button, Stack } from '@mui/material';
import { useFilterContext } from './filterContext';







const CurrentFilterDisplay = () => {
  const filterContext = useFilterContext();

  return (
    <Box
      border="2px solid pink"
      borderRadius={2}
      p={2}
      sx={{ maxWidth: '99%', margin: '2', backgroundColor: '#fff' }}
    >
    <Typography><strong>Suodattimet: </strong></Typography>
      <Stack direction="row" spacing={3}>
        <Typography variant="body1">
          <strong>Lukuvuosi:</strong> 
        </Typography>
          <Typography variant="body1">
            <strong>Suoritustapa:</strong> {}
          </Typography>
        <Button
          variant="text"
          sx={{ alignSelf: 'start', textTransform: 'none', color: 'primary.main' }}
        >
          Tyhjennä suodattimet
        </Button>
      </Stack>
    </Box>
  );
};

export default CurrentFilterDisplay;
