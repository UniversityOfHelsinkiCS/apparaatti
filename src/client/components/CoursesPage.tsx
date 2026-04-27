import { Box, Button, Table, TableBody, TableCell, TableHead, TableRow, Typography, TextField, Pagination } from '@mui/material'
import { Navigate } from 'react-router-dom'
import { useState } from 'react'
import useRequiredUser from '../util/useRequiredUser.ts'
import { RedirectToLogin } from '../util/redirectToLogin.ts'
import useApi from '../util/useApi.tsx'

interface CourseUnit {
  id: string
  courseCode: string
  name: {
    fi: string
    en: string
    sv: string
  }
}

interface Course {
  id: string
  name: {
    fi: string
    en: string
    sv: string
  }
  customCodeUrns: Record<string, string[]>
  Cus?: CourseUnit[]
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
  
  // Active search values (what's actually sent to API)
  const [nameSearch, setNameSearch] = useState('')
  const [urnSearch, setUrnSearch] = useState('')
  const [courseCodeSearch, setCourseCodeSearch] = useState('')

  const handleSearch = () => {
    setNameSearch(nameInput)
    setUrnSearch(urnInput)
    setCourseCodeSearch(courseCodeInput)
    setPage(1) // Reset to first page on new search
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const buildQueryString = () => {
    const params = new URLSearchParams()
    params.append('page', page.toString())
    params.append('limit', '50')
    if (nameSearch) params.append('name', nameSearch)
    if (urnSearch) params.append('urn', urnSearch)
    if (courseCodeSearch) params.append('courseCode', courseCodeSearch)
    return params.toString()
  }

  const { data: coursesData, isLoading: isCoursesLoading } = useApi(
    `admin-courses-${page}-${nameSearch}-${urnSearch}-${courseCodeSearch}`,
    `/api/admin/courses?${buildQueryString()}`,
    'GET',
    null
  ) as { data: PaginatedCoursesResponse | null; isLoading: boolean }

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

  const formatCourseName = (name: { fi: string; en: string; sv: string }) => {
    const names = []
    if (name.fi) names.push(`FI: ${name.fi}`)
    if (name.en) names.push(`EN: ${name.en}`)
    if (name.sv) names.push(`SV: ${name.sv}`)
    return names.length > 0 ? names.join(' | ') : '-'
  }

  const formatCourseCodes = (cus?: CourseUnit[]) => {
    if (!cus || cus.length === 0) {
      return '-'
    }
    return cus.map(cu => cu.courseCode).join(', ')
  }

  const handleVisit = (courseId: string) => {
    window.open(`https://sisu.helsinki.fi/teacher/role/staff/teaching/course-unit-realisations/view/${courseId}/information/basicinfo`, '_blank')
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        All Courses
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Total courses: {totalCourses}
      </Typography>

      {/* Search Fields */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          label="Search by Name"
          variant="outlined"
          size="small"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{ minWidth: 200 }}
        />
        <TextField
          label="Search by URN"
          variant="outlined"
          size="small"
          value={urnInput}
          onChange={(e) => setUrnInput(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{ minWidth: 200 }}
        />
        <TextField
          label="Search by Course Code"
          variant="outlined"
          size="small"
          value={courseCodeInput}
          onChange={(e) => setCourseCodeInput(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{ minWidth: 200 }}
        />
        <Button
          variant="outlined"
          size="small"
          onClick={handleSearch}
          sx={{ 
            color: 'black', 
            borderColor: 'black',
            '&:hover': {
              borderColor: 'black',
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          Search
        </Button>
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Course Name</TableCell>
            <TableCell>Course Codes</TableCell>
            <TableCell>Custom URNs</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {courseList.map((course: Course) => (
            <TableRow key={course.id}>
              <TableCell>{formatCourseName(course.name)}</TableCell>
              <TableCell>{formatCourseCodes(course.Cus)}</TableCell>
              <TableCell>{formatCustomUrns(course.customCodeUrns)}</TableCell>
              <TableCell>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleVisit(course.id)}
                  sx={{ 
                    color: 'black', 
                    borderColor: 'black',
                    '&:hover': {
                      borderColor: 'black',
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  Visit
                </Button>
              </TableCell>
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
