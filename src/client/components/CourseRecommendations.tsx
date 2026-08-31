import { Box, Stack } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { getUnansweredCurrentMandatoryFilters, useFilterContext } from '../contexts/filterContext'
import HySpinner from './common/hy/HySpinner'
import VisuallyHidden from './common/VisuallyHidden'
import CourseRecommendation from './CourseRecommendation'
import NoRecommendationsInfo from './NoRecommendationsInfo'

const HEADING_ID = 'course-recommendations-heading'

type CourseRecommendationsProps = {
  onOpenFilters: () => void
}

const CourseRecommendations = ({ onOpenFilters }: CourseRecommendationsProps) => {
  const filterContext = useFilterContext()
  const { finalRecommendedCourses: recommendations, isLoading, filters } = filterContext
  const { t } = useTranslation()

  const count = recommendations?.length ?? 0
  const unansweredMandatory = getUnansweredCurrentMandatoryFilters(filters, filterContext)

  const announcement = () => {
    if (isLoading) {
      return t('v2:results.loading')
    }
    if (count === 0 && unansweredMandatory.length > 0) {
      return t('v2:results.unansweredMandatory', {
        count: unansweredMandatory.length,
        question: unansweredMandatory[0].shortName ?? unansweredMandatory[0].id,
      })
    }
    return t('v2:results.count', { count })
  }

  const content = () => {
    if (isLoading) {
      return (
        <Box sx={{ width: '100%', my: 4, display: 'flex', justifyContent: 'center' }}>
          <HySpinner size="2xLarge" colour="black" />
        </Box>
      )
    }

    if (count === 0) {
      return <NoRecommendationsInfo onOpenFilters={onOpenFilters} />
    }

    return (
      <Stack component="ul" spacing={2} sx={{ listStyle: 'none', m: 0, p: 0 }}>
        {recommendations?.map(course => (
          <Box component="li" key={course.id}>
            <CourseRecommendation course={course} />
          </Box>
        ))}
      </Stack>
    )
  }

  return (
    <Box component="section" aria-labelledby={HEADING_ID}>
      <VisuallyHidden component="h2" id={HEADING_ID}>
        {t('v2:results.heading')}
      </VisuallyHidden>
      <VisuallyHidden role="status" aria-live="polite">
        {announcement()}
      </VisuallyHidden>
      {content()}
    </Box>
  )
}

export default CourseRecommendations
