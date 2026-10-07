import { Box, Pagination, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { formatLocalizedCourseName } from '../../../common/nameFormatter.ts'
import type { CourseReviewState, LocalizedString } from '../../../common/types.ts'
import useApi from '../../util/useApi.tsx'
import BlackOutlinedButton from '../common/BlackOutlinedButton.tsx'
import { useAdminUser } from './AdminMain.tsx'
import AdminNavbar from './AdminNavbar.tsx'
import type { CourseSearchValues } from './courseSearchQuery.ts'
import {
  buildCourseQueryString,
  courseSearchCacheKey,
  courseSearchValuesFromFields,
  emptyCourseSearchValues,
} from './courseSearchQuery.ts'
import type { CoursesSearchFieldsValues } from './CoursesSearchFields.tsx'
import CoursesSearchFields from './CoursesSearchFields.tsx'
import ReviewActions from './ReviewActions.tsx'

interface CourseUnit {
  id: string
  courseCode: string
  name: LocalizedString
}

interface Course {
  id: string // cur id
  name: LocalizedString
  nameSpecifier: LocalizedString
  customCodeUrns: Record<string, string[]>
  Cus?: CourseUnit[]
  review?: CourseReviewState
  reviewState?: CourseReviewState
  startDate?: string
  endDate?: string
}

interface PaginatedCoursesResponse {
  courses: Course[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const CoursesPage = () => {
  const { t } = useTranslation()
  const user = useAdminUser()
  const [page, setPage] = useState(1)

  // Active search values (what's actually sent to API)
  const [searchValues, setSearchValues] = useState<CourseSearchValues>(emptyCourseSearchValues)

  const handleSearch = (fields: CoursesSearchFieldsValues) => {
    setSearchValues(courseSearchValuesFromFields(fields))
    setPage(1)
  }

  const {
    data: coursesData,
    isLoading: isCoursesLoading,
    refetch,
  } = useApi<PaginatedCoursesResponse>(
    `admin-courses-${courseSearchCacheKey(searchValues, page)}`,
    `/api/admin/courses?${buildCourseQueryString(searchValues, page, 50)}`,
    'GET',
    undefined
  )

  const courseList: Course[] = coursesData?.courses ?? []
  const totalPages = coursesData?.totalPages ?? 1
  const totalCourses = coursesData?.total ?? 0

  const formatCustomUrns = (customCodeUrns: Record<string, string[]>) => {
    if (!customCodeUrns || Object.keys(customCodeUrns).length === 0) {
      return '-'
    }

    return Object.entries(customCodeUrns)
      .flatMap(([_, values]) => values)
      .map(urn => {
        // Extract the last part after the last colon (e.g., 'kkt-hum' from full URN)
        const parts = urn.split(':')
        return parts[parts.length - 1]
      })
      .join(', ')
  }

  const formatCourseCodes = (cus?: CourseUnit[]) => {
    if (!cus || cus.length === 0) {
      return '-'
    }
    return cus.map(cu => cu.courseCode).join(', ')
  }

  const formatReviewUpdatedAt = (reviewState?: CourseReviewState) => {
    if (!reviewState?.updatedAt) {
      return '-'
    }

    return new Date(reviewState.updatedAt).toLocaleString()
  }

  const formatDateRange = (startDate?: string, endDate?: string) => {
    if (!startDate && !endDate) {
      return '-'
    }

    const start = startDate ? new Date(startDate).toLocaleDateString() : '?'
    const end = endDate ? new Date(endDate).toLocaleDateString() : '?'
    return `${start} - ${end}`
  }

  const handleVisit = (courseId: string) => {
    window.open(
      `https://sisu.helsinki.fi/teacher/role/staff/teaching/course-unit-realisations/view/${courseId}/information/basicinfo`,
      '_blank'
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <AdminNavbar isSuperuser={user.isSuperuser === true} />
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t('v2:admin.courses.pageTitle')}
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        {t('v2:admin.courses.total', { total: totalCourses })}
      </Typography>

      {/* Search Fields — grouped: Name, then URN (include + exclude), then Course code (include + exclude). */}
      <CoursesSearchFields onSearch={handleSearch} />

      {isCoursesLoading ? (
        <Typography>{t('v2:admin.courses.loading')}</Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('v2:admin.courses.table.name')}</TableCell>
              <TableCell>{t('v2:admin.courses.table.codes')}</TableCell>
              <TableCell>{t('v2:admin.courses.table.customUrns')}</TableCell>
              <TableCell>{t('v2:admin.courses.table.dates')}</TableCell>
              <TableCell>{t('v2:admin.courses.table.review')}</TableCell>
              <TableCell>{t('v2:admin.courses.table.reviewUpdated')}</TableCell>
              <TableCell>{t('v2:admin.courses.table.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courseList.map((course: Course) => (
              <TableRow key={course.id}>
                {(() => {
                  const reviewState = course.reviewState ?? course.review ?? null

                  return (
                    <>
                      <TableCell>{formatLocalizedCourseName(course)}</TableCell>
                      <TableCell>{formatCourseCodes(course.Cus)}</TableCell>
                      <TableCell>{formatCustomUrns(course.customCodeUrns)}</TableCell>
                      <TableCell>{formatDateRange(course.startDate, course.endDate)}</TableCell>
                      <TableCell>
                        <ReviewActions
                          key={`${course.id}-${reviewState?.updatedAt ?? 'no-review'}`}
                          curId={course.id}
                          reviewState={reviewState}
                          onSaved={refetch}
                        />
                      </TableCell>
                      <TableCell>{formatReviewUpdatedAt(reviewState)}</TableCell>
                      <TableCell>
                        <BlackOutlinedButton size="small" onClick={() => handleVisit(course.id)}>
                          {t('v2:admin.courses.visit')}
                        </BlackOutlinedButton>
                      </TableCell>
                    </>
                  )
                })()}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Pagination */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
          showFirstButton
          showLastButton
        />
      </Box>
    </Box>
  )
}

export default CoursesPage
