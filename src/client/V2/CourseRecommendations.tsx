import { Box, Stack } from '@mui/material'
import { CourseRecommendation } from '../../common/types'
import CourseRecommendationV2 from './CourseRecommendationV2' // Import CourseRecommendationV2
import { useFilterContext } from './filterContext'

const CourseRecommendations = () => {
  const { courseRecommendations, selectedPeriods } = useFilterContext()

  const recommendations = courseRecommendations as CourseRecommendation

  const points = recommendations?.pointBasedRecommendations ?? []

  const filteredCourses =
    selectedPeriods.length > 0
      ? points.filter((c) => c.course.period?.name && selectedPeriods.includes(c.course.period.name))
      : points

  if(!recommendations || !points){
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
          {filteredCourses.map((course) => (
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
