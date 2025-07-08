import { Box, Stack, Typography } from '@mui/material'
import CourseRecommendation from './CourseRecommendation'
import type { CourseRecommendation as CourseRecommendationType } from '../../common/types'
import ActionButton from './actionButton'

const CourseRecommendationsPage = ({onClose, recommendations}: {onClose: () => void, recommendations: CourseRecommendationType[]}) => {
  return (
    <Box>

      <Stack>
        <ActionButton onClick={onClose} text="Edellinen"/>
        <Typography variant="h6" sx={{ marginBottom: 2, marginTop: 6 }}>
          Ehdotetut kurssit:
        </Typography>

        <Stack
          spacing={2}
          sx={{
            maxHeight: '80vh',
            overflowY: 'auto',
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
