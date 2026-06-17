import { Box, Stack } from '@mui/material'
import { useState } from 'react'

import { useFilterContext } from '../contexts/filterContext'
import { sortCourses } from '../util/courseSort'
import CourseRecommendationV2 from './CourseRecommendationV2'
import CourseSortControls, { type SortDirection, type SortMode } from './CourseSortControls'
import NoRecommendationsInfo from './NoRecommendationsInfo'

const CourseRecommendations = () => {
  const { finalRecommendedCourses } = useFilterContext()
  const [sortMode, setSortMode] = useState<SortMode>('recommended')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const recommendations = finalRecommendedCourses

  if (!recommendations || recommendations.length === 0) {
    return <NoRecommendationsInfo></NoRecommendationsInfo>
  }

  const sortedCourses = sortCourses(recommendations, sortMode, sortDirection)
  return (
    <Box>
      <Stack>
        <CourseSortControls
          sortMode={sortMode}
          sortDirection={sortDirection}
          onChange={setSortMode}
          onDirectionChange={setSortDirection}
        />

        <Stack
          spacing={2}
          sx={{
            paddingLeft: 0,
            paddingRight: 2,
            paddingTop: 2,
            paddingBottom: 10,
          }}
        >
          {sortedCourses.map(course => (
            <CourseRecommendationV2 key={course.id} course={course} />
          ))}
        </Stack>
      </Stack>
    </Box>
  )
}

export default CourseRecommendations
