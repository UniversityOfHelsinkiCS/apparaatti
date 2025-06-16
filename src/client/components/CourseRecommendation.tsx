import type { CourseRealization, CourseRecommendation as CourseRecommendationType } from '../../common/types'
import { Box, Button, Paper, Typography } from '@mui/material'

const CourseRecommendation = ({ course }: { course: CourseRecommendationType }) => {
  if (!course) return null
  const baseUrl = 'https://studies.helsinki.fi/kurssit/toteutus'
  const courseUrl = `${baseUrl}/${course.course.id}`
  return (
    <Paper elevation={2} sx={{ padding: 2, margin: 1 }}>
      <Box>
        <Typography variant="h6" component="h2" gutterBottom>
          {course.course.name.fi}
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {course.courseCodes.map(code => code.toString()).join(', ')}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          href={courseUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ marginTop: 1 }}
        >
          näytä
        </Button>
      </Box>
    </Paper>
  )
}

export default CourseRecommendation