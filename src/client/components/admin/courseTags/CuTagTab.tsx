import {
  Alert,
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { CourseTag, LocalizedString } from '../../../../common/types.ts'
import useApi from '../../../util/useApi.tsx'
import { fetchCuTagStates, saveCuTag } from './courseTagUtils.ts'
import {
  matrixContainerSx,
  stickyCornerCellSx,
  stickyFirstCellSx,
  stickyHeaderCellSx,
  verticalHeaderLabelSx,
} from './matrixStyles.ts'
import TagCell from './TagCell.tsx'

const PAGE_SIZE = 50

interface CourseUnit {
  id: string
  courseCode: string
  name: LocalizedString
}

interface Course {
  id: string
  Cus?: CourseUnit[]
}

interface PaginatedCoursesResponse {
  courses: Course[]
}

interface CuTagTabProps {
  tags: CourseTag[]
}

const CuTagTab = ({ tags }: CuTagTabProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [courseCode, setCourseCode] = useState('')

  const { data: coursesData, isLoading } = useApi<PaginatedCoursesResponse>(
    `course-tags-cus-${courseCode}`,
    `/api/admin/courses?page=1&limit=${PAGE_SIZE}${courseCode ? `&courseCode=${courseCode}` : ''}`,
    'GET',
    undefined
  )

  const courseUnits = Object.values(
    Object.fromEntries(
      (coursesData?.courses ?? []).flatMap(course => (course.Cus ?? []).map(cu => [cu.id, cu] as const))
    )
  ) as CourseUnit[]
  const cuIds = courseUnits.map(cu => cu.id)

  const { data: cuStates } = useQuery({
    queryKey: ['course-tag-cu-states', cuIds.join(',')],
    queryFn: () => fetchCuTagStates(cuIds),
    enabled: cuIds.length > 0,
  })

  const hasTag = (cuId: string, tagKey: string) =>
    cuStates?.find(state => state.cuId === cuId)?.tagKeys.includes(tagKey) ?? false

  const handleToggle = async (cuId: string, tagKey: string) => {
    await saveCuTag(cuId, tagKey, !hasTag(cuId, tagKey))
    await queryClient.invalidateQueries({ queryKey: ['course-tag-cu-states'] })
    await queryClient.invalidateQueries({ queryKey: ['course-tag-states'] })
  }

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        {t('v2:courseTags.cu.explanation')}
      </Alert>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          size="small"
          label={t('v2:courseTags.cu.courseCode')}
          value={courseCode}
          onChange={event => setCourseCode(event.target.value)}
        />
      </Stack>

      {isLoading ? (
        <Typography>{t('v2:admin.loading')}</Typography>
      ) : (
        <TableContainer sx={matrixContainerSx}>
          <Table size="small" stickyHeader sx={{ width: 'auto' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={stickyCornerCellSx}>{t('v2:courseTags.cu.courseUnit')}</TableCell>
                <TableCell align="right" sx={stickyHeaderCellSx}>
                  {t('v2:courseTags.cu.realisations')}
                </TableCell>
                {tags.map(tag => (
                  <TableCell key={tag.key} align="center" sx={stickyHeaderCellSx}>
                    <Tooltip title={tag.description ?? tag.key} disableInteractive>
                      <Box component="span" sx={verticalHeaderLabelSx}>
                        {tag.key}
                      </Box>
                    </Tooltip>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {courseUnits.map(cu => (
                <TableRow key={cu.id} hover>
                  <TableCell sx={stickyFirstCellSx}>
                    {cu.courseCode} {cu.name?.fi ?? ''}
                  </TableCell>
                  <TableCell align="right">
                    {cuStates?.find(state => state.cuId === cu.id)?.realisationCount ?? 0}
                  </TableCell>
                  {tags.map(tag => (
                    <TableCell key={tag.key} align="center" sx={{ p: 0.25 }}>
                      <TagCell
                        tagKey={tag.key}
                        description={tag.description}
                        state={hasTag(cu.id, tag.key) ? 'added' : 'unset'}
                        onClick={() => handleToggle(cu.id, tag.key)}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}

export default CuTagTab
