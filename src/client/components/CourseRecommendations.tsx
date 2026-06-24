import { Stack } from '@mui/material'

import { useFilterContext } from '../contexts/filterContext'
import CourseRecommendation from './CourseRecommendation'
import NoRecommendationsInfo from './NoRecommendationsInfo'

const CourseRecommendations = () => {
  const { finalRecommendedCourses: recommendations } = useFilterContext()

  if (!recommendations || recommendations.length === 0) {
    return <NoRecommendationsInfo />
  }

  return (
    <Stack spacing={2}>
      {recommendations.map(course => (
        <CourseRecommendation key={course.id} course={course} />
      ))}
    </Stack>
  )
}

export default CourseRecommendations
