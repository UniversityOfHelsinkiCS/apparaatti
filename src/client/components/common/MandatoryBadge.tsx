import { Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

const MandatoryBadge = () => {
  const { t } = useTranslation()

  return (
    <Typography
      sx={{
        mr: 0.5,
        px: 1,
        py: 0.375,
        borderRadius: 1,
        bgcolor: '#75baf3',
        color: '#000000',
        fontSize: '0.8rem',
        fontWeight: 600,
        lineHeight: 1.4,
      }}
    >
      {t('question:mandatory')}
    </Typography>
  )
}

export default MandatoryBadge