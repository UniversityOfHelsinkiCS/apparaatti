import { Box, Typography, Stack } from '@mui/material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import { useTranslation } from 'react-i18next'
import { CourseCoordinates, UserCoordinates } from '../../../common/types'

interface RecommendationReasonsPopoverContentProps {
  courseCoordinates: CourseCoordinates
  userCoordinates: UserCoordinates
}

const RecommendationReasonsPopoverContent = ({
  courseCoordinates,
  userCoordinates,
}: RecommendationReasonsPopoverContentProps) => {
  const { t } = useTranslation()

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

  const getMatchStatus = (key: keyof CourseCoordinates) => {
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
          const matchStatus = getMatchStatus(key as keyof CourseCoordinates)
          if (matchStatus === null) {
            return null
          }

          const filterName = t(coordinateToFilterMap[key])
          const isMatch = matchStatus

          if (!isMatch) {
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
