import SearchIcon from '@mui/icons-material/Search'
import { Button, InputAdornment, Paper, Stack, TextField, Typography } from '@mui/material'
import { type ReactNode, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { CourseRecommendation } from '../../common/types'
import { translateLocalizedString } from '../util/i18n'

interface CourseRecommendationSearchProps {
  courses: CourseRecommendation[]
  children: (filteredCourses: CourseRecommendation[]) => ReactNode
}

const normalizeSearchText = (value: string) => value.toLowerCase()

const matchesCourseNameSearch = (
  course: CourseRecommendation,
  normalizedSearchQuery: string
) => {
  if (normalizedSearchQuery === '') {
    return true
  }

  const searchableNames = [
    translateLocalizedString(course.course.name),
    ...Object.values(course.course.name).filter((name): name is string => Boolean(name)),
  ]

  return searchableNames.some((name) =>
    normalizeSearchText(name).includes(normalizedSearchQuery)
  )
}

const CourseRecommendationSearch = ({ courses, children }: CourseRecommendationSearchProps) => {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setSearchQuery('')
  }, [courses])

  const normalizedSearchQuery = normalizeSearchText(searchQuery.trim())
  const filteredCourses = courses.filter((course) =>
    matchesCourseNameSearch(course, normalizedSearchQuery)
  )

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          mx: 1,
          mt: 1,
          mb: 2,
          p: 2,
          borderRadius: 2,
          border: '1px solid',
          borderColor: '#d6dbe1',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)',
        }}
      >
        <Stack spacing={1.5}>
          <TextField
            fullWidth
            size="small"
            label={t('v2:recommendationSearch.label')}
            placeholder={t('v2:recommendationSearch.placeholder')}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Stack>
      </Paper>
      {filteredCourses.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mx: 1,
            mb: 2,
            borderRadius: 2,
            border: '1px solid',
            borderColor: '#d6dbe1',
            backgroundColor: '#ffffff',
            textAlign: 'center',
          }}
        >
          <Stack spacing={1.5} alignItems="center">
            <Typography variant="h6" component="h2" sx={{ color: '#17212b' }}>
              {t('v2:recommendationSearch.noMatchesTitle')}
            </Typography>
            <Typography variant="body2" sx={{ color: '#52606d', maxWidth: 520 }}>
              {t('v2:recommendationSearch.noMatchesDescription')}
            </Typography>
            <Button variant="outlined" onClick={() => setSearchQuery('')}>
              {t('v2:recommendationSearch.clearButton')}
            </Button>
          </Stack>
        </Paper>
      ) : (
        children(filteredCourses)
      )}
    </>
  )
}

export default CourseRecommendationSearch