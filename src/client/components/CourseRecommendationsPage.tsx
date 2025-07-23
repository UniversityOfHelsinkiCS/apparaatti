import { Accordion, AccordionDetails, AccordionSummary, Box, Stack, Typography } from '@mui/material'
import type { CourseRecommendation as CourseRecommendationType, CourseRecommendations } from '../../common/types'
import ActionButton from './actionButton'
import CourseRecommendation from './CourseRecommendation'

const CourseRecommendationsPage = ({onClose, recommendations, display}: {onClose: () => void, recommendations: CourseRecommendations, display: boolean}) => {

  const relevant: CourseRecommendationType[] = recommendations?.relevantRecommendations != null ? recommendations.relevantRecommendations : []
  const other: CourseRecommendationType[] = recommendations?.recommendations != null ? recommendations.recommendations : []

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
          <CourseListing titleText = {'Tarkimmat suositukset: '} defaultExpanded={true} courses={relevant}/>

          <CourseListing titleText = {'Kaikki suositukset (tarkkuus voi vaihdella): '} defaultExpanded={false}  courses={other}/>
        
        </Stack>
      
      </Stack>
    </Box>
  )
}
const CourseListing = ({defaultExpanded, courses, titleText}: {defaultExpanded: boolean, courses: CourseRecommendationType[], titleText: string}) => {

  return (
    
    <Accordion defaultExpanded = {defaultExpanded} sx={{background: 'lightgray'}}>
      <AccordionSummary
        aria-controls="panel1-content"
        id="panel1-header"
      >
        <Typography>{titleText}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {courses.map((course) => (
          <CourseRecommendation key={course.course.id} course={course} />
        ))}
      </AccordionDetails>
    </Accordion>

  )
}

export default CourseRecommendationsPage
