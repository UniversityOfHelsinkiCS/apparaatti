import { Box, Stack, Typography } from '@mui/material'
import CourseRecommendation from './CourseRecommendation'
import type { CourseRecommendation as CourseRecommendationType } from '../../common/types'
import ActionButton from './actionButton'

const CourseRecommendationsPage = ({onClose, recommendations}: {onClose: () => void, recommendations: CourseRecommendationType[]}) => {
  return (
    <Box>
      <Stack>
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
