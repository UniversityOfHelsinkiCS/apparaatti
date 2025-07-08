import { Box, Button, Stack, Typography } from '@mui/material'
import CourseRecommendation from './CourseRecommendation'
import type { CourseRecommendation as CourseRecommendationType } from '../../common/types'

const CourseRecommendationsPage = ({onClose, recommendations}: {onClose: () => void, recommendations: CourseRecommendationType[]}) => {
  return (
    <Box>
      <Stack>
        <Typography variant="h6" sx={{ marginBottom: 2, marginTop: 6 }}>
          Ehdotetut kurssit:
        </Typography>

        <Button color={'inherit'}
          onClick={onClose}>Edellinen</Button>
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
