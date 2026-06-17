import { Box, Pagination, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { useState } from 'react'
import { Navigate } from 'react-router-dom'

import { formatLocalizedCourseName } from '../../../common/nameFormatter.ts'
import type { CourseReviewState, LocalizedString } from '../../../common/types.ts'
import { RedirectToLogin } from '../../util/redirectToLogin.ts'
import useApi from '../../util/useApi.tsx'
import useRequiredUser from '../../util/useRequiredUser.ts'
import BlackOutlinedButton from '../common/BlackOutlinedButton.tsx'
import AdminNavbar from './AdminNavbar.tsx'
import type { ReviewStatusFilterValue } from './CoursesSearchFields.tsx'
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
}

interface PaginatedCoursesResponse {
  courses: Course[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const CoursesPage = () => {
  const { user, isLoading: isUserLoading, isUnauthorized } = useRequiredUser()
  const [page, setPage] = useState(1)

  // Input field values (what user types)
  const [nameInput, setNameInput] = useState('')
  const [urnInput, setUrnInput] = useState('')
  const [courseCodeInput, setCourseCodeInput] = useState('')
  const [excludeUrnsInput, setExcludeUrnsInput] = useState('')
  const [excludeCourseCodesInput, setExcludeCourseCodesInput] = useState('')
  const [reviewStatusInput, setReviewStatusInput] = useState<ReviewStatusFilterValue>('all')

  // Active search values (what's actually sent to API)
  const [nameSearch, setNameSearch] = useState('')
  const [urnSearch, setUrnSearch] = useState('')
  const [courseCodeSearch, setCourseCodeSearch] = useState('')
  const [excludeUrnsSearch, setExcludeUrnsSearch] = useState('')
  const [excludeCourseCodesSearch, setExcludeCourseCodesSearch] = useState('')
  const [reviewStatusSearch, setReviewStatusSearch] = useState<ReviewStatusFilterValue>('all')

  const handleSearch = () => {
    setNameSearch(nameInput)
    setUrnSearch(urnInput)
    setCourseCodeSearch(courseCodeInput)
    setExcludeUrnsSearch(excludeUrnsInput)
    setExcludeCourseCodesSearch(excludeCourseCodesInput)
    setReviewStatusSearch(reviewStatusInput)
    setPage(1) // Reset to first page on new search
  }

  const buildQueryString = () => {
    const params = new URLSearchParams()
    params.append('page', page.toString())
    params.append('limit', '50')
    if (nameSearch) params.append('name', nameSearch)
    if (urnSearch) params.append('urn', urnSearch)
    if (courseCodeSearch) params.append('courseCode', courseCodeSearch)
    if (excludeUrnsSearch) params.append('excludeUrns', excludeUrnsSearch)
    if (excludeCourseCodesSearch) params.append('excludeCourseCodes', excludeCourseCodesSearch)
    if (reviewStatusSearch !== 'all') params.append('reviewStatus', reviewStatusSearch)
    return params.toString()
  }

  const {
    data: coursesData,
    isLoading: isCoursesLoading,
    refetch,
  } = useApi<PaginatedCoursesResponse>(
    `admin-courses-${page}-${nameSearch}-${urnSearch}-${courseCodeSearch}-${excludeUrnsSearch}-${excludeCourseCodesSearch}-${reviewStatusSearch}`,
    `/api/admin/courses?${buildQueryString()}`,
    'GET',
    undefined
  )

  if (isUnauthorized) {
    return <RedirectToLogin />
  }

  if (isUserLoading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <div>Loading...</div>
  }

  if (!user.isAdmin) {
    return <Navigate to={'/'} replace />
  }

  if (isCoursesLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading courses...</Typography>
      </Box>
    )
  }

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
        KK- Courses
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Showing only realisations whose course code starts with KK-. Total: {totalCourses}
      </Typography>

      {/* Search Fields — grouped: Name, then URN (include + exclude), then Course code (include + exclude). */}
      <CoursesSearchFields
        nameInput={nameInput}
        urnInput={urnInput}
        excludeUrnsInput={excludeUrnsInput}
        courseCodeInput={courseCodeInput}
        excludeCourseCodesInput={excludeCourseCodesInput}
        reviewStatusInput={reviewStatusInput}
        setNameInput={setNameInput}
        setUrnInput={setUrnInput}
        setExcludeUrnsInput={setExcludeUrnsInput}
        setCourseCodeInput={setCourseCodeInput}
        setExcludeCourseCodesInput={setExcludeCourseCodesInput}
        setReviewStatusInput={setReviewStatusInput}
        onSearch={handleSearch}
      />

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Course Name</TableCell>
            <TableCell>Course Codes</TableCell>
            <TableCell>Custom URNs</TableCell>
            <TableCell>Review</TableCell>
            <TableCell>Review Updated</TableCell>
            <TableCell>Actions</TableCell>
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
                        Visit
                      </BlackOutlinedButton>
                    </TableCell>
                  </>
                )
              })()}
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
