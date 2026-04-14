import { Box, Typography, Stack } from '@mui/material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import { useTranslation } from 'react-i18next'
import { UserCoordinates } from '../../common/types'
import { useFilterContext, getCoordinateDisplayName } from '../contexts/filterContext'

interface RecommendationReasonsPopoverContentProps {
  courseCoordinates: UserCoordinates
  userCoordinates: UserCoordinates
}

const RecommendationReasonsPopoverContent = ({
  courseCoordinates,
  userCoordinates,
}: RecommendationReasonsPopoverContentProps) => {
  const { t } = useTranslation()
  const filterContext = useFilterContext()
  const { uiVariant } = filterContext
  
  const hideIncorrect = uiVariant.find(u => u.name === 'recommendation-reasons-incorrect-hidden')?.value === 'true'

  const getMatchStatus = (key: keyof UserCoordinates) => {
    const userValue = userCoordinates[key]
    const courseValue = courseCoordinates[key]

    if (userValue === null || userValue === undefined) {
      return null
    }

    
    if(key === 'date'){
      return true
    }
    return userValue === courseValue
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" component="h3" gutterBottom>
        {t('recommendationReasons:title')}
      </Typography>

      <Typography variant="body2" sx={{ mb: 2 }}>
        {t('recommendationReasons:description')}
      </Typography>

      <Stack spacing={1}>
        {filterContext.filters.filter(f => f.coordinateKey).map((filter) => {
          const key = filter.coordinateKey as string
          const matchStatus = getMatchStatus(key as keyof UserCoordinates)
          if (matchStatus === null) {
            return null
          }

          if (filter.hideInRecommendationReasons) {
            return null
          }

          const filterName = getCoordinateDisplayName(key, filterContext)
          const isMatch = matchStatus

          if (!isMatch && hideIncorrect) {
            return null
          }

          return (
            <Stack key={key} direction="row" alignItems="center" spacing={1}>
              {isMatch ? (
                <CheckCircleOutlineIcon color="success" />
              ) : (
                <CancelOutlinedIcon color="error" />
              )}
              <Typography variant="body1">{filterName}</Typography>
            </Stack>
          )
        })}
      </Stack>
    </Box>
  )
}

export default RecommendationReasonsPopoverContent
