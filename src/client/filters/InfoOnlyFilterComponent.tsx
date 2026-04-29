import { Box, Typography } from '@mui/material'
import Markdown from 'react-markdown'

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
      <Markdown>{extraInfo}</Markdown>
    </Box>
  )
}

export default InfoOnlyFilterComponent
