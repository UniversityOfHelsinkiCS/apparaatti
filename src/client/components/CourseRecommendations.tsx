import { Box, Stack } from '@mui/material'

import { useFilterContext } from '../contexts/filterContext'
import HySpinner from './common/hy/HySpinner'
import CourseRecommendation from './CourseRecommendation'
import NoRecommendationsInfo from './NoRecommendationsInfo'

type CourseRecommendationsProps = {
  onOpenFilters: () => void
}

const CourseRecommendations = ({ onOpenFilters }: CourseRecommendationsProps) => {
  const { finalRecommendedCourses: recommendations, isLoading } = useFilterContext()

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', my: 4, display: 'flex', justifyContent: 'center' }}>
        <HySpinner size="2xLarge" colour="black" />
      </Box>
    )
  }

  if (!recommendations?.length) {
    return <NoRecommendationsInfo onOpenFilters={onOpenFilters} />
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
