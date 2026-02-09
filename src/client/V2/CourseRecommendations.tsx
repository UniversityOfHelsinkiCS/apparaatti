import { Box, Stack } from '@mui/material'
import { CourseRecommendation } from '../../common/types'
import CourseRecommendationV2 from './CourseRecommendationV2'
import { useFilterContext } from './filterContext'
import NoRecommendationsInfo from './components/NoRecommendationsInfo'

const CourseRecommendations = () => {
  const { finalRecommendedCourses } = useFilterContext()

  const recommendations = finalRecommendedCourses

  const points = recommendations?.pointBasedRecommendations ?? []

  if(!recommendations || !points){
    return (<></>)
  }

  if(points.length === 0) {
    return <NoRecommendationsInfo />
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
          {points.map((course) => (
            <CourseRecommendationV2
              key={course.course.id}
              course={course}
              userCoordinates={recommendations.userCoordinates}
            />
          ))}
        </Stack>
      </Stack>
    </Box>
  )
}

export default CourseRecommendations
