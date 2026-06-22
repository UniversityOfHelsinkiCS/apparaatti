import { Box, Typography } from '@mui/material'

import AppMarkdown from '../components/common/AppMarkdown'

interface InfoOnlyFilterComponentProps {
  extraInfo?: string
}

const InfoOnlyFilterComponent = ({ extraInfo }: InfoOnlyFilterComponentProps) => {
  if (!extraInfo) {
    return (
      <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
        No information available
      </Typography>
    )
  }

  return (
    <Box sx={{ py: 1 }}>
      <AppMarkdown>{extraInfo}</AppMarkdown>
    </Box>
  )
}

export default InfoOnlyFilterComponent
