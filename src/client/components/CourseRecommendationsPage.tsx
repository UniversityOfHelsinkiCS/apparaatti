import { Box, Stack } from '@mui/material'
import CourseRecommendation from './CourseRecommendation'
import type { CourseRecommendation as CourseRecommendationType } from '../../common/types'
import ActionButton from './actionButton'
import { useEffect, useRef } from 'react'

const CourseRecommendationsPage = ({onClose, recommendations}: {onClose: () => void, recommendations: CourseRecommendationType[]}) => {
  const topOfPage = useRef<HTMLAnchorElement | null>(null)
  useEffect(() => {
    topOfPage.current?.scrollIntoView()
  }, [])
  return (
    <Box>
      <Stack>
        <a ref={topOfPage} style={{display: 'none'}}></a>
        <ActionButton onClick={onClose} text="Takaisin"/>
        <Stack
          spacing={2}
          sx={{
            paddingLeft: 0,
            paddingRight: 2,
            paddingTop: 2,
            paddingBottom: 10,
          }}
        >
          {recommendations.map((course) => (
            <CourseRecommendation key={course.course.id} course={course} />
          ))}
        </Stack>
      
      </Stack>
    </Box>
  )
}

export default CourseRecommendationsPage
