import { Box, Stack } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { useFilterContext } from '../contexts/filterContext'
import HySpinner from './common/hy/HySpinner'
import VisuallyHidden from './common/VisuallyHidden'
import CourseRecommendation from './CourseRecommendation'
import NoRecommendationsInfo from './NoRecommendationsInfo'

const HEADING_ID = 'course-recommendations-heading'

type CourseRecommendationsProps = {
  onOpenFilters: () => void
}

const CourseRecommendations = ({ onOpenFilters }: CourseRecommendationsProps) => {
  const { finalRecommendedCourses: recommendations, isLoading } = useFilterContext()
  const { t } = useTranslation()

  const count = recommendations?.length ?? 0

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
        {isLoading ? t('v2:results.loading') : t('v2:results.count', { count })}
      </VisuallyHidden>
      {content()}
    </Box>
  )
}

export default CourseRecommendations
