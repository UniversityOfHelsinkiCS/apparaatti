import { Accordion, AccordionDetails, AccordionSummary, Box, Stack, Typography } from '@mui/material'
import type { CourseRecommendation as CourseRecommendationType, CourseRecommendations } from '../../common/types'
import ActionButton from './actionButton'
import CourseRecommendation from './CourseRecommendation'

const CourseRecommendationsPage = ({onClose, recommendations, display}: {onClose: () => void, recommendations: CourseRecommendations, display: boolean}) => {

  const relevant = recommendations?.relevantRecommendations != null ? recommendations.relevantRecommendations : []
  const other = recommendations?.recommendations != null ? recommendations.recommendations : []

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
          <Accordion defaultExpanded sx={{background: 'lightgray'}}>
            <AccordionSummary
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <Typography>Tarkimmat suositukset: </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {relevant.map((course) => (
                <CourseRecommendation key={course.course.id} course={course} />
              ))}
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <Typography>Kaikki suositukset (tarkkuus voi vaihdella) </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {other.map((course) => (
                <CourseRecommendation key={course.course.id} course={course} />
              ))}
            </AccordionDetails>
          </Accordion>
        </Stack>
      
      </Stack>
    </Box>
  )
}


export default CourseRecommendationsPage
