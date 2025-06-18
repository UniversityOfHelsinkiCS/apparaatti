import type { CourseRecommendation as CourseRecommendationType } from '../../common/types'
import { Box, Button, Paper, Stack, Typography } from '@mui/material'

const CourseRecommendation = ({ course }: { course: CourseRecommendationType }) => {
  if (!course) return null
  const baseUrl = 'https://studies.helsinki.fi/kurssit/toteutus'
  const courseUrl = `${baseUrl}/${course.course.id}`

  const courseDateRange = (course: any) => {
    const startDate = new Date(course.startDate)
    const endDate = new Date(course.endDate)

    const start = startDate.getDay() + '.' + (startDate.getMonth() + 1) + '.' + startDate.getFullYear()
    const end = endDate.getDay() + '.' + (endDate.getMonth() + 1) + '.' + endDate.getFullYear()

    return start + ' - ' + end


  }
  return (
    <Paper elevation={2} sx={{ padding: 2, margin: 1 }}>
      <Box>
        <Typography variant="h6" component="h2" gutterBottom>
          {course.course.name.fi}
        </Typography>
        <Stack direction={'row'}>
         
          <Typography sx={{marginRight: 'auto'}} variant="body2" color="textSecondary" gutterBottom>
            {course.course.courseCodes.map(code => code.toString()).join(', ')}
          </Typography>
      
      
          <Typography>
            {courseDateRange(course.course)}
          </Typography>
     
        </Stack>
       
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