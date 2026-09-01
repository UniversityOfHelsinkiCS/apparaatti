import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import AppMarkdown from '../components/common/AppMarkdown'

interface InfoOnlyFilterComponentProps {
  extraInfo?: string
}

const InfoOnlyFilterComponent = ({ extraInfo }: InfoOnlyFilterComponentProps) => {
  const { t } = useTranslation()

  if (!extraInfo) {
    return (
      <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
        {t('question:noExtrainfo')}
      </Typography>
    )
  }

  return (
    <Box sx={{ px: 2 }}>
      <AppMarkdown>{extraInfo}</AppMarkdown>
    </Box>
  )
}

export default InfoOnlyFilterComponent
