import type { CourseRealization, CourseRecommendation as CourseRecommendationType } from '../../common/types'
import { Box, Paper, Typography } from '@mui/material'

const CourseRecommendation = ({ course }: { course: CourseRealization }) => {
  if (!course) return null

  return (
    <Paper elevation={2} sx={{ padding: 2, margin: 1 }}>
      <Box>
        <Typography variant="h5" component="h2" gutterBottom>
          {course.name}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {course.courseCode}
        </Typography>
        <Typography variant="body2" color="textSecondary">
         opintopisteet: {course.credits}
        </Typography>
        <p>
          Jännitys: {course.fear}, Opetusmuoto: {course.teachingMethod}, Kokemus: {course.experience}
        </p>
      </Box>
    </Paper>
  )
}

export default CourseRecommendation