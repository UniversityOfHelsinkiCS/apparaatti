import type { CourseRecommendation as CourseRecommendationType, UserCoordinates } from '../../common/types'
import { Box, Button, Paper, Stack, Typography, IconButton, Modal } from '@mui/material'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import { translateLocalizedString } from '../util/i18n'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import RecommendationReasonsModalV2 from './components/RecommendationReasonsModalV2'

const CourseRecommendationV2 = ({
  course,
  userCoordinates,
}: {
  course: CourseRecommendationType
  userCoordinates: UserCoordinates
}) => {
  const {t} = useTranslation()
  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const baseUrl = 'https://studies.helsinki.fi/kurssit/toteutus'
  const courseUrl = `${baseUrl}/${course.course.id}`
  const courseCodes = course.course.courseCodes.map((code) => code).join(', ')

  const creditString:() => string = () => {
    if(!course.course.credits){
      return ''
    }
    const maxCredits: number = course.course.credits.map(c=>c['max']).sort((a, b) => b - a )[0]
    const minCredits: number= course.course.credits.map(c => c['min']).sort()[0]

    if(!maxCredits && !minCredits){
      return ''
    }
    else if(!minCredits){
      return maxCredits.toString()
    }
    else if(!maxCredits){
      return minCredits.toString()
    }
    else if(maxCredits === minCredits){
      return maxCredits.toString()
    }

    return  minCredits + '-' + maxCredits
  }
  const courseDateRange = (course: any) => {
    const startDate = new Date(course.startDate)
    const endDate = new Date(course.endDate)

    const start =
      startDate.getDate() +
      '.' +
      (startDate.getMonth() + 1) +
      '.' +
      startDate.getFullYear()
    const end =
      endDate.getDate() +
      '.' +
      (endDate.getMonth() + 1) +
      '.' +
      endDate.getFullYear()

    return start + ' - ' + end
  }
  if (!course) return null
  return (
    <Paper elevation={2} sx={{ padding: 2, margin: 1 }}>
      <Box>
        <Typography variant="h6" component="h2" gutterBottom>
          {translateLocalizedString(course.course.name)}
          <IconButton onClick={handleOpen} size="small" sx={{ marginLeft: 1 }}>
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
        </Typography>
        <RecommendationReasonsModalV2
          open={open}
          onClose={handleClose}
          courseCoordinates={course.coordinates}
          userCoordinates={userCoordinates}
        />
        <Stack direction={'column'}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Typography
              variant="body2"
              color="textSecondary"
              gutterBottom
            >
              {creditString()} {t('course:credits')}
            </Typography>
            <Typography
              variant="body2"
              color="textSecondary"
              gutterBottom
            >
              {courseCodes}
            </Typography>

            <Typography>{courseDateRange(course.course)}</Typography>
          </Stack>
        </Stack>
        
        <Button
          variant="contained"
          color="primary"
          href={courseUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ marginTop: 1, backgroundColor: 'lightblue' }}
        >
          {t('course:show')}
        </Button>
      </Box>
    </Paper>
  )
}

export default CourseRecommendationV2
