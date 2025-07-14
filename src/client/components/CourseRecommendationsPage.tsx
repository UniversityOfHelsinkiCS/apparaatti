import { Box, Stack, Typography } from '@mui/material'
import CourseRecommendation from './CourseRecommendation'
import type { CourseRecommendations, CourseRecommendation as CourseRecommendationType } from '../../common/types'
import ActionButton from './actionButton'

const CourseRecommendationsPage = ({onClose, recommendations, display}: {onClose: () => void, recommendations: CourseRecommendations, display: boolean}) => {
  return (
    <Box sx={{display: display === true ? 'block' : 'none'}}>
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
          <Typography>Tarkimmat suositukset: </Typography>
          {recommendations.relevantRecommendations.map((course) => (
            <CourseRecommendation key={course.course.id} course={course} />
          ))}


          <Typography>Kaikki suositukset (tarkkuus voi vaihdella): </Typography>
          {recommendations.recommendations.map((course) => (
            <CourseRecommendation key={course.course.id} course={course} />
          ))}

        </Stack>
      
      </Stack>
    </Box>
  )
}

export default CourseRecommendationsPage
