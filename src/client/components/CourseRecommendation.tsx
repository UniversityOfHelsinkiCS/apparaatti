import type { CourseRealization, CourseRecommendation as CourseRecommendationType } from '../../common/types'
import { Box, Paper, Typography } from '@mui/material'

const CourseRecommendation = ({ course }: { course: CourseRecommendationType }) => {
  if (!course) return null

  return (
    <Paper elevation={2} sx={{ padding: 2, margin: 1 }}>
      <Box>
        <Typography variant="h5" component="h2" gutterBottom>
          {course.course.name.fi}
        </Typography>
        <Typography variant="body2" color="textSecondary">
         
        </Typography>
        <Typography variant="body2" color="textSecondary">
       
        </Typography>
       </Box>
    </Paper>
  )
}

export default CourseRecommendation