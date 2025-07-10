import { Box, Stack } from '@mui/material'
import CourseRecommendation from './CourseRecommendation'
import type { CourseRecommendation as CourseRecommendationType } from '../../common/types'
import ActionButton from './actionButton'
import { useEffect, useRef } from 'react'

const CourseRecommendationsPage = ({onClose, recommendations, display}: {onClose: () => void, recommendations: CourseRecommendationType[], display: boolean}) => {
  const topOfPage = useRef<HTMLAnchorElement | null>(null)
  useEffect(() => {
    if(display){    
      topOfPage.current?.scrollIntoView()  
    }
  }, [display])
  return (
    <Box sx={{display: display === true ? 'block' : 'none'}}>
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
