import { Box, Typography, Stack } from '@mui/material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import { useTranslation } from 'react-i18next'
import { UserCoordinates } from '../../../common/types'
import { filterConfigMap, useFilterContext } from '../filterContext'

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
  const filterConfig = filterConfigMap(filterContext)

  const coordinateToFilterMap: { [key: string]: string } = {
    date: 'filter:period',
    org: 'filter:organisation',
    lang: 'filter:language',
    graduation: 'filter:graduation',
    mentoring: 'filter:mentoring',
    integrated: 'filter:integrated',
    studyPlace: 'filter:studyPlace',
    replacement: 'filter:replacement',
    challenge: 'filter:challenge',
    independent: 'filter:independent',
    flexible: 'filter:flexible',
    mooc: 'filter:mooc',
    finmu: 'filter:finmu',
  }

  // Map coordinate keys to filter IDs for checking hideInRecommendationReasons
  const coordinateToFilterId: { [key: string]: string } = {
    date: 'study-period',
    org: 'study-field-select',
    lang: 'lang',
    graduation: 'graduation',
    mentoring: 'mentoring',
    integrated: 'integrated',
    studyPlace: 'study-place',
    replacement: 'replacement',
    challenge: 'challenge',
    independent: 'independent',
    flexible: 'flexible',
    mooc: 'mooc',
    finmu: 'finmu',
  }

  const getMatchStatus = (key: keyof UserCoordinates) => {
    const userValue = userCoordinates[key]
    const courseValue = courseCoordinates[key]

    if (userValue === null || userValue === undefined) {
      return null // User didn't answer or chose "I don't care"
    }

    
    if(key === 'date'){
      return true
    }
    // For now, a simple equality check. This might need more complex logic
    // depending on how coordinates are compared in the recommender.
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
        {Object.keys(coordinateToFilterMap).map((key) => {
          const matchStatus = getMatchStatus(key as keyof UserCoordinates)
          if (matchStatus === null) {
            return null
          }

          // Check if this filter should be hidden in recommendation reasons
          const filterId = coordinateToFilterId[key]
          const filterCfg = filterId ? filterConfig.get(filterId) : null
          const hideInReasons = filterCfg?.hideInRecommendationReasons ?? false
          
          if (hideInReasons) {
            return null
          }

          const filterName = t(coordinateToFilterMap[key])
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
