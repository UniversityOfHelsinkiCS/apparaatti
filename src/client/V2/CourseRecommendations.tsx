import { Box, Stack } from '@mui/material'
import { CourseRecommendations as CourseRecommendationsType } from '../../common/types'
import { useTranslation } from 'react-i18next'
import CourseListingV2 from './CourseListingV2'
import { useFilterContext } from './filterContext'

const CourseRecommendations = () => {
  const { t } = useTranslation()
  const { courseRecommendations } = useFilterContext()

  const recommendations = courseRecommendations as CourseRecommendationsType

  const points = recommendations?.pointBasedRecommendations ?? []
  const other = recommendations?.recommendations ?? []

  if(!recommendations || !points || !other){
    return (<></>)
  }
  return (
    <Box>
      <Stack>
        <Stack
          spacing={2}
          sx={{
            paddingLeft: 0,
            paddingRight: 2,
            paddingTop: 2,
            paddingBottom: 10,
          }}
        >
          <CourseListingV2
            userCoordinates={recommendations.userCoordinates}
            titleText={t('recommendations:accurate')}
            defaultExpanded={true}
            courses={points}
          />
        </Stack>
      </Stack>
    </Box>
  )
}

export default CourseRecommendations
