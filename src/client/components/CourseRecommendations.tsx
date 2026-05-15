import { Box, Stack } from '@mui/material'
import CourseRecommendationV2 from './CourseRecommendationV2'
import { useFilterContext } from '../contexts/filterContext'
import NoRecommendationsInfo from './NoRecommendationsInfo'
import { useState } from 'react'
import CourseSortControls, { type SortMode, type SortDirection } from './CourseSortControls'
import { sortCourses } from '../util/courseSort'
import CourseRecommendationSearch from './CourseRecommendationSearch'
import type { CourseRecommendation } from '../../common/types'

const CourseRecommendations = () => {
  const { finalRecommendedCourses } = useFilterContext()
  const [sortMode, setSortMode] = useState<SortMode>('recommended')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const recommendations = finalRecommendedCourses

  const points = recommendations?.pointBasedRecommendations ?? []

  if(!recommendations || !points){
    return (<></>)
  }

  if(points.length === 0) {
    return <NoRecommendationsInfo />
  }

  const sortedCourses = sortCourses(points, sortMode, sortDirection)

  return (
    <Box>
      <Stack>
        <CourseSortControls sortMode={sortMode} sortDirection={sortDirection} onChange={setSortMode} onDirectionChange={setSortDirection} />
        <CourseRecommendationSearch courses={sortedCourses}>
          {(filteredCourses: CourseRecommendation[]) => (
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
                />
              ))}
            </Stack>
          )}
        </CourseRecommendationSearch>
      </Stack>
    </Box>
  )
}

export default CourseRecommendations
